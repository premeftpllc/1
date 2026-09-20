# Recursive Globbing in pathlib.Path.glob (Python 3.14)

## Three Key Points About Recursive Globbing

### 1. **Double-Asterisk Pattern (`**`) Enables Recursion**

The `**` pattern is the core mechanism for recursive directory traversal in `pathlib.Path.glob()`. Without it, glob only searches the current directory:

```python
from pathlib import Path

p = Path('.')

# Non-recursive: finds only files directly in '.'
list(p.glob('*.py'))
# Output: [PosixPath('test_pathlib.py'), PosixPath('setup.py')]

# Recursive: finds .py files in ALL subdirectories at any depth
list(p.glob('**/*.py'))
# Output: [PosixPath('test_pathlib.py'), PosixPath('setup.py'),
#          PosixPath('docs/conf.py'), PosixPath('build/lib/pathlib.py')]
```

### 2. **`glob()` vs `rglob()`: Two Ways to Recursively Match**

While both achieve recursion, they differ in pattern matching behavior:

| Method | Pattern Syntax | Behavior |
| -------- | --------------- | ---------- |
| `Path.glob(pattern)` | `'**/*'` | Matches files in starting directory + all subdirectories; returns results with full paths from starting point |
| `Path.rglob(pattern)` | `'*'` | Equivalent to `glob('**/pattern')`; searches entire tree; more intuitive for recursive matching |

```python
p = Path('.')

# Both find same files but differ in pattern syntax:
list(p.glob('**/*.py'))   # Uses ** pattern
list(p.rglob('.py'))      # Uses rglob with * pattern (same result)

# rglob is cleaner for pure recursive searches
list(p.rglob('.txt'))  # Find all .txt files recursively
```

### 3. **Important: Pattern Must Not Be Followed by Separators**

If the glob pattern ends with a path separator (`/` or `\`), recursive matching across directories is **disabled**:

```python
p = Path('.')

# Recursive: matches files in subdirectories
list(p.glob('**/test_*'))
# Matches: test.py, subdir/test.py, nested/deep/test.py

# Non-recursive: pattern ends with separator, only matches current dir
list(p.glob('**/*.py/'))  # This will NOT match any files!

# Use rglob for cleaner recursive file matching
list(p.rglob('.py'))      # Matches .py in all directories
```

## Complete Examples

### Finding Files Recursively

```python
from pathlib import Path

base = Path('src')

# Find all Python files recursively
python_files = list(base.glob('**/*.py'))

# Find all test files (recursively)
test_files = base.rglob('test_*.py')

# Find configuration files in any depth level
config_files = list(base.rglob('*.cfg'))

# Find directories matching pattern
subdirs = list(base.rglob('subdir*'))  # Note: may include files if not careful
```

### Filtering Results

```python
from pathlib import Path
import re

def get_source_files(directory):
    """Get all .py source files, excluding tests"""
    py_files = [f for f in directory.rglob('*.py')]
    return [f for f in py_files if 'test' not in str(f) and '__pycache__' not in str(f)]

def get_large_directories(root_path, size_threshold=1024):
    """Find directories larger than threshold KB"""
    large_dirs = []
    for item in root_path.rglob('*'):
        if item.is_dir() and item.stat().st_size > size_threshold:
            large_dirs.append(item)
    return large_dirs
```

### Handling Hidden Files

By default, `Path.glob()` does NOT match hidden files (starting with `.`). Use `rglob()` or explicit patterns:

```python
# Exclude hidden files by default
list(p.glob('**/*.txt'))  # Won't match .hidden.txt

# To include hidden files, use rglob which searches everything
list(p.rglob('*.txt'))    # Will also find .hidden.txt if in search path
```

## Best Practices

1. **Use `rglob()` for pure recursive searches** - It's cleaner and more explicit
2. **Validate results** - Check `is_file()` before processing
3. **Sort for consistency** - Directory listings can vary across systems:

   ```python
   sorted_files = sorted(list(p.rglob('*.py')))
   ```

4. **Consider performance** - Deep directory trees can slow down glob operations
5. **Handle symlinks** - By default, `Path` follows symlinks to directories

## Performance Notes

- `glob()` and `rglob()` are efficient but scale with directory tree size
- For very large projects, consider caching or incremental scanning
- Memory usage depends on number of matches returned (all results in memory)
