# Recursive Globbing with `pathlib.Path` (Python 3.14)

`Path.glob()` searches relative to a starting path. A pattern without `**` examines matches at its current directory level; `**` matches zero or more complete directory segments.

```python
from pathlib import Path

source = Path("src")

list(source.glob("*.py"))
list(source.glob("**/*.py"))
list(source.rglob("*.py"))
```

The first call finds Python files directly in `src`. The latter two search `src` and every descendant directory.

## `glob()` and `rglob()`

For a relative pattern, `rglob()` is shorthand for prepending `**/` to a `glob()` pattern:

```python
source.glob("**/*.py")
source.rglob("*.py")
```

Use `glob()` when the pattern describes a directory structure:

```python
list(source.glob("**/plugins/*.py"))
```

Use `rglob()` when the goal is to search the entire tree for one filename pattern:

```python
list(source.rglob("*.json"))
```

## Trailing Separators

A trailing `/` restricts a pattern to directories. It does not disable recursion:

```python
list(source.glob("**/cache/"))
list(source.rglob("*/"))
```

The first call finds directories named `cache` at any depth. A pattern such as `"**/*.py/"` matches directories whose names end in `.py`; it is not a file pattern.

## Filtering Results

Check the type of each match before processing it when a pattern can return both files and directories:

```python
python_files = [path for path in source.rglob("*.py") if path.is_file()]
test_files = [path for path in source.rglob("test_*.py") if path.is_file()]
```

`pathlib` does not treat dot-prefixed names as special, so matching patterns can include hidden files.

## Performance

Recursive searches visit the directory tree, so their cost grows with the number of directories examined. `Path.glob()` and `Path.rglob()` do not guarantee cached results; cache results in application code when repeated scans are expensive.

Sort results when deterministic output matters:

```python
for path in sorted(source.rglob("*.py")):
    print(path)
```
