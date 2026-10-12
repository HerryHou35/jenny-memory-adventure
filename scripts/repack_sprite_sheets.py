from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "art" / "sprites" / "walkcycles"
OUTPUT_DIR = ROOT / "dist" / "assets" / "sprites"

SHEETS = {
    "jenny-walk-4x4-v1.png": "jenny-walk-v2.png",
    "herry-walk-4x4-v1.png": "herry-walk-v2.png",
    "peanut-walk-4x4-v1.png": "peanut-walk-v2.png",
}


def quiet_split(alpha: Image.Image, expected: int, radius: int = 45) -> int:
    """Find the quietest horizontal scanline near an expected row boundary."""
    width, height = alpha.size
    pixels = alpha.load()
    start = max(1, expected - radius)
    end = min(height - 1, expected + radius)
    scores = []
    for y in range(start, end + 1):
        opaque = sum(pixels[x, y] > 24 for x in range(width))
        scores.append((opaque, abs(y - expected), y))
    return min(scores)[2]


def column_runs(alpha: Image.Image, top: int, bottom: int) -> list[tuple[int, int]]:
    """Locate the four separated characters in one animation row."""
    width, _ = alpha.size
    pixels = alpha.load()
    active = []
    for x in range(width):
        count = sum(pixels[x, y] > 24 for y in range(top, bottom))
        if count > 5:
            active.append(x)

    runs = []
    start = previous = active[0]
    for x in active[1:]:
        if x > previous + 15:
            runs.append((start, previous + 1))
            start = x
        previous = x
    runs.append((start, previous + 1))
    if len(runs) != 4:
        raise RuntimeError(f"Expected four frames, found {len(runs)} in row {top}:{bottom}")
    return runs


def alpha_bbox(image: Image.Image, box: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    crop = image.crop(box)
    bbox = crop.getchannel("A").getbbox()
    if bbox is None:
        raise RuntimeError(f"Empty frame at {box}")
    left, top, right, bottom = bbox
    return box[0] + left, box[1] + top, box[0] + right, box[1] + bottom


def repack(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGBA")
    alpha = image.getchannel("A")
    width, height = image.size
    splits = [0]
    for row in range(1, 4):
        splits.append(quiet_split(alpha, round(height * row / 4)))
    splits.append(height)

    frames = []
    for row in range(4):
        top, bottom = splits[row], splits[row + 1]
        for left, right in column_runs(alpha, top, bottom):
            box = alpha_bbox(image, (left, top, right, bottom))
            frames.append(image.crop(box))

    max_width = max(frame.width for frame in frames)
    max_height = max(frame.height for frame in frames)
    cell_width = max_width + 24
    cell_height = max_height + 20
    sheet = Image.new("RGBA", (cell_width * 4, cell_height * 4), (0, 0, 0, 0))

    for index, frame in enumerate(frames):
        row, column = divmod(index, 4)
        x = column * cell_width + (cell_width - frame.width) // 2
        y = row * cell_height + cell_height - frame.height - 8
        sheet.alpha_composite(frame, (x, y))

    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(destination, optimize=True)
    print(f"{source.name} -> {destination.name}: {sheet.width}x{sheet.height}, cell {cell_width}x{cell_height}")


if __name__ == "__main__":
    for source_name, output_name in SHEETS.items():
        repack(SOURCE_DIR / source_name, OUTPUT_DIR / output_name)
