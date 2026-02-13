"""File utility functions for Architectural Platform."""

import os
from typing import Optional

ALLOWED_EXTENSIONS = {'pdf', 'dwg', 'dxf', 'jpg', 'jpeg', 'png', 'svg', 'tif', 'tiff'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_file_type(filename: str) -> Optional[str]:
    """Get file type from extension."""
    if '.' not in filename:
        return None
    
    ext = filename.rsplit('.', 1)[1].lower()
    
    file_types = {
        'pdf': 'pdf',
        'dwg': 'cad',
        'dxf': 'cad',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'svg': 'image',
        'tif': 'image',
        'tiff': 'image'
    }
    
    return file_types.get(ext)


def get_file_size(filepath: str) -> int:
    """Get file size in bytes."""
    return os.path.getsize(filepath)


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal."""
    # Remove any path components
    filename = os.path.basename(filename)
    # Remove any potentially dangerous characters
    filename = ''.join(c for c in filename if c.isalnum() or c in '._-')
    return filename
