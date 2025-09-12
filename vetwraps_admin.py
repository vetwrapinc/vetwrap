"""
VetWraps Admin — Desktop Dashboard (Single File)

Purpose:
  - Admin GUI to connect to the VetWraps website backend (Netlify Functions)
  - Authenticate via Netlify Identity (email + password)
  - View outgoing orders (quotes) with organized info:
      • Duration (time since created)
      • Progress (vs expected turnaround)
      • Time Left (estimate based on turnaround)
      • Efficiency (simple on-track indicator)
      • Task details (name, email, project type, notes)

Requirements:
  - Python 3.9+
  - pip install PySide6 requests

Usage:
  - python vetwraps_admin.py

Notes:
  - Set the Base URL to your deployed site (e.g., https://vetwrapinc.netlify.app or https://vetwraps.com)
  - Netlify Identity must be enabled; your admin email must be in ADMIN_EMAILS env var on Netlify.
  - The program stores a small JSON config next to the script (base URL and email).
"""

from __future__ import annotations

import json
import os
import sys
import threading
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

try:
    import requests
except Exception as e:  # pragma: no cover
    print("This tool requires 'requests'. Install with: pip install requests")
    raise

try:
    from PySide6 import QtCore, QtGui, QtWidgets
except Exception as e:  # pragma: no cover
    print("This tool requires 'PySide6'. Install with: pip install PySide6")
    raise


# ---- Branding / Theme ----
BG = "#0A0A0F"
FG = "#FFFFFF"
ACCENT_BLUE = "#5FB7FA"
ACCENT_AMBER = "#FFB26A"

APP_TITLE = "VetWraps Admin"
CONFIG_FILE = os.path.join(os.path.dirname(__file__), "vetwraps_admin.config.json")


# ---- Data Model ----
@dataclass
class Order:
    id: str
    name: str
    email: str
    project_type: str
    notes: str
    rush: bool
    created_at: datetime
    ip: str
    user_agent: str
    status: str = "new"
    assignee: str = ""
    processed_at: Optional[datetime] = None

    # Derived
    duration: timedelta = timedelta(0)
    expected_days: float = 7.5  # default
    progress_pct: int = 0
    time_left: timedelta = timedelta(0)
    efficiency_pct: int = 100


def parse_iso_z(s: str) -> datetime:
    if not s:
        return datetime.now(timezone.utc)
    try:
        # Supabase tends to emit ISO strings with UTC 'Z'
        s2 = s.replace("Z", "+00:00")
        dt = datetime.fromisoformat(s2)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)


def human_span(td: timedelta) -> str:
    total = int(abs(td.total_seconds()))
    days, rem = divmod(total, 86400)
    hrs, rem = divmod(rem, 3600)
    mins, _ = divmod(rem, 60)
    if days > 0:
        return f"{days}d {hrs}h"
    if hrs > 0:
        return f"{hrs}h {mins}m"
    return f"{mins}m"


def compute_metrics(order: Order, now: Optional[datetime] = None) -> Order:
    now = now or datetime.now(timezone.utc)
    elapsed = now - order.created_at
    expected_days = 5.5 if order.rush else 7.5
    expected = timedelta(days=expected_days)
    progress = min(1.0, max(0.0, elapsed.total_seconds() / max(1.0, expected.total_seconds())))
    time_left = expected - elapsed
    efficiency = max(0, min(100, int(round((1.0 - progress) * 100))))

    order.duration = elapsed
    order.expected_days = expected_days
    order.progress_pct = int(round(progress * 100))
    order.time_left = time_left if time_left.total_seconds() > 0 else timedelta(0)
    order.efficiency_pct = efficiency
    return order


# ---- API Client ----
class ApiClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.token: Optional[str] = None

    def identity_login(self, email: str, password: str) -> str:
        url = f"{self.base_url}/.netlify/identity/token"
        data = {
            "grant_type": "password",
            "username": email,
            "password": password,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        r = requests.post(url, data=data, headers=headers, timeout=30)
        if r.status_code != 200:
            raise RuntimeError(f"Login failed ({r.status_code}): {r.text[:180]}")
        tok = r.json().get("access_token")
        if not tok:
            raise RuntimeError("Login failed: no access_token returned")
        self.token = tok
        return tok

    def fetch_orders(self) -> List[Order]:
        # Uses quotes-list as "orders" source; adjust path if you add a dedicated orders function.
        url = f"{self.base_url}/.netlify/functions/quotes-list"
        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        admin_token = os.environ.get('VETWRAPS_ADMIN_TOKEN')
        if admin_token:
            headers['x-admin-token'] = admin_token
        r = requests.get(url, headers=headers, timeout=30)
        if r.status_code != 200:
            raise RuntimeError(f"Fetch failed ({r.status_code}): {r.text[:180]}")
        items = r.json().get("items", [])
        orders: List[Order] = []
        for it in items:
            order = Order(
                id=str(it.get("id", "")),
                name=str(it.get("name", "")),
                email=str(it.get("email", "")),
                project_type=str(it.get("projectType", "")),
                notes=str(it.get("notes", "")),
                rush=bool(it.get("rush", False)),
                created_at=parse_iso_z(str(it.get("createdAt", ""))),
                ip=str(it.get("ip", "")),
                user_agent=str(it.get("userAgent", "")),
                status=str(it.get("status", "new")),
                assignee=str(it.get("assignee", "")),
                processed_at=parse_iso_z(str(it.get("processedAt", ""))) if it.get("processedAt") else None,
            )
            orders.append(compute_metrics(order))
        return orders

    def update_order(self, order_id: str, status: Optional[str] = None, assignee: Optional[str] = None, processed: Optional[bool] = None) -> Dict[str, Any]:
        url = f"{self.base_url}/.netlify/functions/quote-update"
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        admin_token = os.environ.get('VETWRAPS_ADMIN_TOKEN')
        if admin_token:
            headers['x-admin-token'] = admin_token
        payload: Dict[str, Any] = {"id": order_id}
        if status is not None:
            payload["status"] = status
        if assignee is not None:
            payload["assignee"] = assignee
        if processed is True:
            payload["processedAt"] = True
        if processed is False:
            payload["processedAt"] = None
        r = requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)
        if r.status_code != 200:
            raise RuntimeError(f"Update failed ({r.status_code}): {r.text[:180]}")
        return r.json()


# ---- GUI ----
class LoginPage(QtWidgets.QWidget):
    logged_in = QtCore.Signal(str, str)  # base_url, token

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName("LoginPage")
        self.api: Optional[ApiClient] = None
        self._build_ui()
        self._load_config()

    def _build_ui(self):
        layout = QtWidgets.QVBoxLayout(self)
        layout.setContentsMargins(30, 30, 30, 30)
        layout.setSpacing(18)

        # Header
        header = QtWidgets.QLabel("VetWraps Admin - Access")
        header.setObjectName("Header")
        header.setAlignment(QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter)
        layout.addWidget(header)

        form = QtWidgets.QFormLayout()
        form.setLabelAlignment(QtCore.Qt.AlignLeft)
        form.setFormAlignment(QtCore.Qt.AlignLeft | QtCore.Qt.AlignTop)
        form.setHorizontalSpacing(12)
        form.setVerticalSpacing(10)

        self.base_url = QtWidgets.QLineEdit()
        self.base_url.setPlaceholderText("https://vetwrapinc.netlify.app")
        self.email = QtWidgets.QLineEdit()
        self.email.setPlaceholderText("admin@email")
        self.password = QtWidgets.QLineEdit()
        self.password.setPlaceholderText("password")
        self.password.setEchoMode(QtWidgets.QLineEdit.Password)
        self.token = QtWidgets.QLineEdit()
        self.token.setPlaceholderText("admin token (x-admin-token)")

        form.addRow("Base URL", self.base_url)
        form.addRow("Email", self.email)
        form.addRow("Password", self.password)
        form.addRow("Admin Token", self.token)

        container = QtWidgets.QFrame()
        container.setObjectName("GlassFrame")
        v = QtWidgets.QVBoxLayout(container)
        v.setContentsMargins(16, 16, 16, 16)
        v.addLayout(form)
        layout.addWidget(container)

        self.status = QtWidgets.QLabel("")
        layout.addWidget(self.status)

        btns = QtWidgets.QHBoxLayout()
        self.login_btn = QtWidgets.QPushButton("Continue")
        self.login_btn.clicked.connect(self._on_login)
        self.save_btn = QtWidgets.QPushButton("Save Config")
        self.save_btn.clicked.connect(self._save_config)
        btns.addWidget(self.login_btn)
        btns.addWidget(self.save_btn)
        btns.addStretch(1)
        layout.addLayout(btns)

        layout.addStretch(1)

    def _on_login(self):
        base = self.base_url.text().strip()
        admin_token = self.token.text().strip()
        if not base or not admin_token:
            self.status.setText("Base URL and Admin Token required.")
            return
        self.status.setText("Preparing dashboard...")
        self.login_btn.setEnabled(False)

        def worker():
            try:
                self.api = ApiClient(base)
                self._save_config()  # store base/email
                os.environ['VETWRAPS_ADMIN_TOKEN'] = admin_token
                self.logged_in.emit(base, '')
                self.status.setText("Ready.")
            except Exception as e:
                self.status.setText(f"Login failed: {e}")
            finally:
                self.login_btn.setEnabled(True)

        threading.Thread(target=worker, daemon=True).start()

    def _save_config(self):
        data = {"base_url": self.base_url.text().strip(), "email": self.email.text().strip()}
        try:
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            self.status.setText("Config saved.")
        except Exception as e:
            self.status.setText(f"Failed to save config: {e}")

    def _load_config(self):
        if not os.path.exists(CONFIG_FILE):
            return
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.base_url.setText(data.get("base_url", ""))
            self.email.setText(data.get("email", ""))
        except Exception:
            pass


class DashboardPage(QtWidgets.QWidget):
    logout_requested = QtCore.Signal()

    def __init__(self, base_url: str, token: str, parent=None):
        super().__init__(parent)
        self.base_url = base_url
        self.client = ApiClient(base_url)
        self.client.token = token
        self._orders: List[Order] = []
        self._build_ui()
        self.refresh()

    def _build_ui(self):
        layout = QtWidgets.QVBoxLayout(self)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(12)

        # Top bar
        top = QtWidgets.QHBoxLayout()
        title = QtWidgets.QLabel("VetWraps — Orders Dashboard")
        title.setObjectName("Header")
        top.addWidget(title)
        top.addStretch(1)
        self.refresh_btn = QtWidgets.QPushButton("Refresh")
        self.refresh_btn.clicked.connect(self.refresh)
        self.logout_btn = QtWidgets.QPushButton("Log out")
        self.logout_btn.clicked.connect(self.logout_requested.emit)
        top.addWidget(self.refresh_btn)
        top.addWidget(self.logout_btn)
        layout.addLayout(top)

        # Controls
        controls = QtWidgets.QHBoxLayout()
        self.search = QtWidgets.QLineEdit()
        self.search.setPlaceholderText("Filter by name, email, project…")
        self.search.textChanged.connect(self._apply_filter)
        controls.addWidget(self.search)

        self.std_days = QtWidgets.QDoubleSpinBox()
        self.std_days.setRange(1.0, 30.0)
        self.std_days.setValue(7.5)
        self.std_days.setSuffix(" d (standard)")
        self.std_days.valueChanged.connect(self._recompute)
        controls.addWidget(self.std_days)

        self.rush_days = QtWidgets.QDoubleSpinBox()
        self.rush_days.setRange(1.0, 30.0)
        self.rush_days.setValue(5.5)
        self.rush_days.setSuffix(" d (rush)")
        self.rush_days.valueChanged.connect(self._recompute)
        controls.addWidget(self.rush_days)

        # Export CSV
        self.export_btn = QtWidgets.QPushButton("Export CSV")
        self.export_btn.clicked.connect(self.export_csv)
        controls.addWidget(self.export_btn)

        # Auto-refresh
        self.interval = QtWidgets.QComboBox()
        self.interval.addItems(["Off", "30s", "60s", "5m"])
        self.interval.currentIndexChanged.connect(self._interval_changed)
        controls.addWidget(self.interval)

        layout.addLayout(controls)

        self.timer = QtCore.QTimer(self)
        self.timer.timeout.connect(self.refresh)

        # Table
        self.table = QtWidgets.QTableWidget(0, 12)
        self.table.setObjectName("GlassTable")
        self.table.setSelectionBehavior(QtWidgets.QAbstractItemView.SelectRows)
        self.table.setEditTriggers(QtWidgets.QAbstractItemView.NoEditTriggers)
        self.table.setAlternatingRowColors(True)
        self.table.verticalHeader().setVisible(False)
        self.table.setSortingEnabled(True)
        headers = [
            "Created",
            "Name",
            "Email",
            "Project",
            "Rush",
            "Status",
            "Assignee",
            "Duration",
            "Progress",
            "Time Left",
            "Efficiency",
            "Notes",
        ]
        self.table.setHorizontalHeaderLabels(headers)
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.horizontalHeader().setSectionResizeMode(QtWidgets.QHeaderView.ResizeToContents)
        layout.addWidget(self.table)

        # Details
        self.details = QtWidgets.QTextEdit()
        self.details.setObjectName("GlassText")
        self.details.setReadOnly(True)
        self.details.setMinimumHeight(120)
        layout.addWidget(self.details)

        # Actions row
        actions = QtWidgets.QHBoxLayout()
        self.assign_btn = QtWidgets.QPushButton("Assign to me")
        self.assign_btn.clicked.connect(self.assign_to_me)
        self.inprog_btn = QtWidgets.QPushButton("Set In Progress")
        self.inprog_btn.clicked.connect(lambda: self.update_selected_status("in_progress"))
        self.proc_btn = QtWidgets.QPushButton("Mark Processed")
        self.proc_btn.clicked.connect(lambda: self.update_selected_status("processed", processed=True))
        actions.addWidget(self.assign_btn)
        actions.addWidget(self.inprog_btn)
        actions.addWidget(self.proc_btn)
        actions.addStretch(1)
        layout.addLayout(actions)

        self.table.itemSelectionChanged.connect(self._update_details)

    def refresh(self):
        self.refresh_btn.setEnabled(False)

        def worker():
            try:
                orders = self.client.fetch_orders()
            except Exception as e:
                QtWidgets.QMessageBox.critical(self, "Fetch Error", str(e))
                orders = []
            self._orders = orders
            QtCore.QMetaObject.invokeMethod(self, "_populate", QtCore.Qt.QueuedConnection)
            self.refresh_btn.setEnabled(True)

        threading.Thread(target=worker, daemon=True).start()

    @QtCore.Slot()
    def _populate(self):
        # Filtered list
        q = self.search.text().strip().lower()
        data = [o for o in self._orders if _matches(o, q)]
        self.table.setRowCount(len(data))
        for row, o in enumerate(data):
            created_item = QtWidgets.QTableWidgetItem(o.created_at.strftime("%Y-%m-%d %H:%M"))
            name_item = QtWidgets.QTableWidgetItem(o.name)
            email_item = QtWidgets.QTableWidgetItem(o.email)
            proj_item = QtWidgets.QTableWidgetItem(o.project_type)
            rush_item = QtWidgets.QTableWidgetItem("Yes" if o.rush else "No")
            duration_item = QtWidgets.QTableWidgetItem(human_span(o.duration))
            left_item = QtWidgets.QTableWidgetItem(human_span(o.time_left))
            eff_item = QtWidgets.QTableWidgetItem(f"{o.efficiency_pct}%")
            notes_snip = (o.notes[:100] + "…") if len(o.notes) > 100 else o.notes
            notes_item = QtWidgets.QTableWidgetItem(notes_snip)

            # Progress bar as widget
            pb = QtWidgets.QProgressBar()
            pb.setRange(0, 100)
            pb.setValue(o.progress_pct)
            pb.setTextVisible(True)
            pb.setFormat(f"{o.progress_pct}%")
            pb.setObjectName("Progress")

            self.table.setItem(row, 0, created_item)
            self.table.setItem(row, 1, name_item)
            self.table.setItem(row, 2, email_item)
            self.table.setItem(row, 3, proj_item)
            self.table.setItem(row, 4, rush_item)
            self.table.setItem(row, 5, QtWidgets.QTableWidgetItem(o.status))
            self.table.setItem(row, 6, QtWidgets.QTableWidgetItem(o.assignee or "-"))
            self.table.setItem(row, 7, duration_item)
            self.table.setCellWidget(row, 8, pb)
            self.table.setItem(row, 9, left_item)
            self.table.setItem(row, 10, eff_item)
            self.table.setItem(row, 11, notes_item)

            # Due-soon highlight
            try:
                days = 5.5 if o.rush else 7.5
                due = o.created_at + timedelta(days=days)
                left = (due - datetime.now(timezone.utc)).total_seconds()
                if left < 48 * 3600:
                    for col in range(0, 12):
                        item = self.table.item(row, col)
                        if item is None:
                            continue
                        item.setBackground(QtGui.QBrush(QtGui.QColor(255, 178, 106, 26)))
            except Exception:
                pass

        if data:
            self.table.selectRow(0)
        else:
            self.details.setPlainText("")

    def _apply_filter(self, _):
        self._populate()

    def _recompute(self, _):
        std = float(self.std_days.value())
        rush = float(self.rush_days.value())
        now = datetime.now(timezone.utc)
        for o in self._orders:
            o.expected_days = rush if o.rush else std
            expected = timedelta(days=o.expected_days)
            elapsed = now - o.created_at
            progress = min(1.0, max(0.0, elapsed.total_seconds() / max(1.0, expected.total_seconds())))
            o.progress_pct = int(round(progress * 100))
            o.time_left = expected - elapsed if expected > elapsed else timedelta(0)
            o.efficiency_pct = max(0, min(100, int(round((1.0 - progress) * 100))))
        self._populate()

    def _update_details(self):
        rows = self.table.selectionModel().selectedRows()
        if not rows:
            self.details.setPlainText("")
            return
        idx = rows[0].row()
        # Use filtered data order
        q = self.search.text().strip().lower()
        data = [o for o in self._orders if _matches(o, q)]
        if idx >= len(data):
            self.details.setPlainText("")
            return
        o = data[idx]
        txt = (
            f"ID: {o.id}\n"
            f"Created: {o.created_at.isoformat()}\n"
            f"Name: {o.name}\n"
            f"Email: {o.email}\n"
            f"Project: {o.project_type}\n"
            f"Rush: {'Yes' if o.rush else 'No'}\n"
            f"Status: {o.status}\n"
            f"Assignee: {o.assignee or '-'}\n"
            f"Duration: {human_span(o.duration)}\n"
            f"Progress: {o.progress_pct}%\n"
            f"Time Left: {human_span(o.time_left)}\n"
            f"Efficiency: {o.efficiency_pct}%\n"
            f"IP: {o.ip}\n"
            f"UA: {o.user_agent}\n\n"
            f"Notes:\n{o.notes}\n"
        )
        self.details.setPlainText(txt)

    # ---- Actions ----
    def _current_filtered_index(self) -> Optional[int]:
        rows = self.table.selectionModel().selectedRows()
        if not rows:
            return None
        idx = rows[0].row()
        q = self.search.text().strip().lower()
        data = [o for o in self._orders if _matches(o, q)]
        return idx if idx < len(data) else None

    def _selected_order(self) -> Optional[Order]:
        idx = self._current_filtered_index()
        if idx is None:
            return None
        q = self.search.text().strip().lower()
        data = [o for o in self._orders if _matches(o, q)]
        return data[idx]

    def assign_to_me(self):
        o = self._selected_order()
        if not o:
            return
        try:
            self.client.update_order(o.id, assignee=self.client_email())
            self.toast("Assigned")
            self.refresh()
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Update Error", str(e))

    def update_selected_status(self, status: str, processed: Optional[bool] = None):
        o = self._selected_order()
        if not o:
            return
        try:
            self.client.update_order(o.id, status=status, processed=processed)
            self.toast("Updated")
            self.refresh()
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Update Error", str(e))

    def client_email(self) -> str:
        # Identity token is opaque; let the server set assignee to caller's email if preferred.
        # For now, prompt or reuse last saved email.
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f).get('email', '')
        except Exception:
            return ''

    def export_csv(self):
        path, _ = QtWidgets.QFileDialog.getSaveFileName(self, "Export CSV", "orders.csv", "CSV Files (*.csv)")
        if not path:
            return
        import csv
        q = self.search.text().strip().lower()
        data = [o for o in self._orders if _matches(o, q)]
        with open(path, 'w', newline='', encoding='utf-8') as f:
            w = csv.writer(f)
            w.writerow(["id","createdAt","name","email","projectType","rush","status","assignee","duration","progressPct","timeLeft","efficiencyPct","notes"])
            for o in data:
                w.writerow([
                    o.id,
                    o.created_at.isoformat(),
                    o.name,
                    o.email,
                    o.project_type,
                    'yes' if o.rush else 'no',
                    o.status,
                    o.assignee,
                    human_span(o.duration),
                    o.progress_pct,
                    human_span(o.time_left),
                    o.efficiency_pct,
                    o.notes.replace('\n',' ').strip(),
                ])
        self.toast("CSV exported")

    def _interval_changed(self):
        m = self.interval.currentText()
        self.timer.stop()
        if m == 'Off':
            return
        ms = {'30s': 30000, '60s': 60000, '5m': 300000}.get(m, 60000)
        self.timer.start(ms)
        self.toast(f"Auto-refresh {m}")


def _matches(o: Order, q: str) -> bool:
    if not q:
        return True
    blob = " ".join([
        o.name.lower(), o.email.lower(), o.project_type.lower(), o.notes.lower(),
    ])
    return q in blob


class MainWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle(APP_TITLE)
        self.resize(1100, 700)
        self._apply_style()
        self.stack = QtWidgets.QStackedWidget()
        self.setCentralWidget(self.stack)

        self.login = LoginPage()
        self.stack.addWidget(self.login)
        self.login.logged_in.connect(self._on_logged_in)

    def _on_logged_in(self, base_url: str, token: str):
        self.dashboard = DashboardPage(base_url, token)
        self.dashboard.logout_requested.connect(self._on_logout)
        self.stack.addWidget(self.dashboard)
        self._fade_to(self.dashboard)

    def _on_logout(self):
        self._fade_to(self.login)
        if hasattr(self, "dashboard"):
            self.stack.removeWidget(self.dashboard)
            self.dashboard.deleteLater()
            delattr(self, "dashboard")

    def _apply_style(self):
        # Load stylesheet to mimic site theme
        self.setStyleSheet(f"""
            QWidget {{
                background: {BG};
                color: {FG};
                selection-background-color: rgba(95,183,250,0.35);
                selection-color: {FG};
                font-family: 'Inter', 'Space Grotesk', 'Segoe UI', Arial, sans-serif;
                font-size: 13px;
            }}
            #Header {{
                font-size: 18px;
                font-weight: 600;
            }}
            #GlassFrame, #GlassText {{
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.12);
                border-radius: 12px;
                box-shadow: 0 6px 28px rgba(0,0,0,0.35);
            }}
            QLineEdit, QPlainTextEdit, QTextEdit, QComboBox, QSpinBox, QDoubleSpinBox {{
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.12);
                border-radius: 8px;
                padding: 6px 8px;
            }}
            QLineEdit:focus, QPlainTextEdit:focus, QTextEdit:focus, QComboBox:focus, QDoubleSpinBox:focus {{
                border: 1px solid rgba(95,183,250,0.6);
            }}
            QPushButton {{
                background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 8px;
                padding: 6px 12px;
            }}
            QPushButton:hover {{
                border-color: rgba(95,183,250,0.6);
                box-shadow: 0 0 16px rgba(95,183,250,0.35);
            }}
            QTableWidget {{
                background: transparent;
                alternate-background-color: rgba(255,255,255,0.03);
                gridline-color: rgba(255,255,255,0.08);
                selection-background-color: rgba(95,183,250,0.25);
                selection-color: {FG};
            }}
            QHeaderView::section {{
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.12);
                padding: 6px;
            }}
            QProgressBar {{
                background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 6px;
                text-align: center;
            }}
            QProgressBar::chunk {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 rgba(95,183,250,0.8), stop:1 rgba(255,178,106,0.8));
                border-radius: 6px;
            }}
            QToolTip { background: rgba(0,0,0,0.8); color: {FG}; border: 1px solid rgba(255,255,255,0.15); }
        """)

    # Fade transition
    def _fade_to(self, widget: QtWidgets.QWidget):
        current = self.stack.currentWidget()
        if current is widget:
            return
        self.stack.setCurrentWidget(widget)
        eff = QtWidgets.QGraphicsOpacityEffect(widget)
        widget.setGraphicsEffect(eff)
        anim = QtCore.QPropertyAnimation(eff, b"opacity", self)
        anim.setDuration(220)
        anim.setStartValue(0.0)
        anim.setEndValue(1.0)
        anim.setEasingCurve(QtCore.QEasingCurve.InOutCubic)
        anim.start(QtCore.QAbstractAnimation.DeleteWhenStopped)

    # Toast helper
    def toast(self, text: str):
        w = QtWidgets.QLabel(text, self)
        w.setStyleSheet("background: rgba(0,0,0,0.7); color: white; padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15);")
        w.adjustSize()
        w.move(self.width() - w.width() - 24, self.height() - w.height() - 24)
        eff = QtWidgets.QGraphicsOpacityEffect(w)
        w.setGraphicsEffect(eff)
        anim = QtCore.QPropertyAnimation(eff, b"opacity", self)
        anim.setDuration(1400)
        anim.setStartValue(0.0)
        anim.setKeyValueAt(0.1, 1.0)
        anim.setKeyValueAt(0.8, 1.0)
        anim.setEndValue(0.0)
        anim.finished.connect(w.deleteLater)
        w.show()
        anim.start(QtCore.QAbstractAnimation.DeleteWhenStopped)


def main():
    app = QtWidgets.QApplication(sys.argv)
    app.setApplicationName(APP_TITLE)
    win = MainWindow()
    win.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
