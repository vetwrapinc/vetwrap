from PIL import Image, ImageDraw
import math

def create_gradient(width, height, colors):
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    for y in range(height):
        ratio = y / (height - 1)
        r = int(colors[0][0] + (colors[1][0] - colors[0][0]) * ratio)
        g = int(colors[0][1] + (colors[1][1] - colors[0][1]) * ratio)
        b = int(colors[0][2] + (colors[1][2] - colors[0][2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return img


def add_orbits(draw, width, height, layers=4):
    center = (width // 2, height // 2)
    max_radius = min(width, height) * 0.45
    for i in range(layers):
        radius = max_radius * (0.4 + i / max(layers, 1) * 0.6)
        bbox = [center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius]
        opacity = 130 - i * 20
        color = (255, 255, 255, max(35, opacity))
        draw.ellipse(bbox, outline=color, width=2)


def add_spark(draw, x, y, size, color):
    draw.ellipse((x - size, y - size, x + size, y + size), fill=color)


def add_grid(draw, width, height, spacing, color):
    for x in range(0, width, spacing):
        draw.line([(x, 0), (x, height)], fill=color, width=1)
    for y in range(0, height, spacing):
        draw.line([(0, y), (width, y)], fill=color, width=1)


def create_veteran_image(path, width, height):
    base = create_gradient(width, height, ((15, 20, 35), (22, 48, 90)))
    overlay = Image.new('RGBA', base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    add_grid(draw, width, height, 80, (40, 75, 120, 80))
    add_orbits(draw, width, height, layers=5)
    for i in range(18):
        angle = (math.pi * 2 / 18) * i
        radius = min(width, height) * 0.35
        x = width / 2 + math.cos(angle) * radius
        y = height / 2 + math.sin(angle) * radius * 0.6
        size = 6 + (i % 3) * 2
        add_spark(draw, x, y, size, (255, 190, 120, 140))
    concentric = Image.new('RGBA', base.size, (0, 0, 0, 0))
    concentric_draw = ImageDraw.Draw(concentric)
    for i in range(6):
        radius = min(width, height) * (0.15 + i * 0.08)
        bbox = [width / 2 - radius, height / 2 - radius, width / 2 + radius, height / 2 + radius]
        color = (95, 183, 250, max(20, 110 - i * 15))
        concentric_draw.ellipse(bbox, outline=color, width=3)
    combined = Image.alpha_composite(overlay, concentric)
    output = Image.alpha_composite(base.convert('RGBA'), combined)
    output.save(path, format='PNG', optimize=True)


def create_precision_image(path, width, height):
    base = create_gradient(width, height, ((12, 18, 32), (48, 22, 70)))
    overlay = Image.new('RGBA', base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    add_grid(draw, width, height, 60, (255, 255, 255, 30))
    for i in range(32):
        angle = (math.pi * 2 / 32) * i
        radius = min(width, height) * (0.15 + (i % 6) * 0.05)
        x = width / 2 + math.cos(angle) * radius
        y = height / 2 + math.sin(angle) * radius
        size = 4 + (i % 5)
        add_spark(draw, x, y, size, (95, 183, 250, 140))
    bands = Image.new('RGBA', base.size, (0, 0, 0, 0))
    bands_draw = ImageDraw.Draw(bands)
    for i in range(8):
        offset = i * 40
        bands_draw.rectangle((0, offset, width, offset + 8), fill=(255, 178, 106, 70))
    add_orbits(draw, width, height, layers=6)
    combined = Image.alpha_composite(overlay, bands)
    output = Image.alpha_composite(base.convert('RGBA'), combined)
    output.save(path, format='PNG', optimize=True)

create_veteran_image('C:/Users/logan/vetwrap/public/images/image-1200x794.png', 1200, 794)
create_precision_image('C:/Users/logan/vetwrap/public/images/image-1200x800.png', 1200, 800)
