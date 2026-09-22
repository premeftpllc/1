def summarize_logs(lines):
    counts = {'INFO': 0, 'WARNING': 0, 'ERROR': 0}
    errors = []
    first_seen = []

    for line in lines:
        stripped_line = line.strip()

        if not stripped_line:
            continue

        level_raw, separator, message = stripped_line.partition(':')
        level = level_raw.strip().upper()
        message = message.strip()

        if not separator or not level or not message:
            continue

        if level not in counts:
            continue

        counts[level] += 1
        if level not in first_seen:
            first_seen.append(level)

        if level == 'ERROR':
            errors.append(message)

    most_common_level = None
    if first_seen:
        most_common_level = max(first_seen, key=lambda level: counts[level])

    return {
        'counts': counts,
        'errors': errors,
        'most_common_level': most_common_level
    }
