import re

MAX_CHUNK_LENGTH = 1000


def split_arabic_text(text: str) -> list[str]:
    """
    Splits Arabic text into chunks respecting sentence boundaries.
    Boundaries: . ؟ ! ؛ : and newlines.
    """
    # Define boundary characters
    boundaries = r"([.؟!؛:\n]+)"

    # Split text keeping the delimiters
    parts = re.split(boundaries, text)

    chunks = []
    current_chunk = ""

    for i in range(0, len(parts), 2):
        segment = parts[i]
        delimiter = parts[i + 1] if i + 1 < len(parts) else ""

        piece = segment + delimiter

        if len(current_chunk) + len(piece) <= MAX_CHUNK_LENGTH:
            current_chunk += piece
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())

            # If a single piece is longer than MAX_CHUNK_LENGTH, we still have to keep it whole
            # to avoid breaking words, or we could split by space. Let's just append it.
            if len(piece) > MAX_CHUNK_LENGTH:
                chunks.append(piece.strip())
                current_chunk = ""
            else:
                current_chunk = piece

    if current_chunk:
        chunks.append(current_chunk.strip())

    # Remove empty chunks
    return [c for c in chunks if c]
