"""Write immutable, content-addressed font assets; retain old URLs for caches."""
import hashlib
from io import BytesIO


def write_bytes(data, folder, stem):
    output = folder/(stem+'-'+hashlib.sha256(data).hexdigest()[:12]+'.woff2')
    if output.exists() and output.read_bytes() != data:
        raise ValueError(f'font asset hash collision: {output}')
    output.write_bytes(data)
    return output


def write_font(font, folder, stem):
    buffer = BytesIO()
    font.save(buffer)
    return write_bytes(buffer.getvalue(), folder, stem)
