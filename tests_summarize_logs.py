from summarize_logs import summarize_logs


def test_normal_mixed_logs():
    logs = [
        'INFO: This is an informational message',
        'WARNING: Something might go wrong here.',
        "ERROR: An error occurred, : but it's fine now:",
        ' INFO   : Another info message.'
    ]

    summary = summarize_logs(logs)
    assert summary == {
        'counts': {'INFO': 2, 'WARNING': 1, 'ERROR': 1},
        'errors': ["An error occurred, : but it's fine now:"],
        'most_common_level': 'INFO'
    }

# Additional tests would follow here...
def test_whitespace_only_input():
    logs = ['   ', '\t\t', '\n']
    summary = summarize_logs(logs)
    assert summary == {
        'counts': {'INFO': 0, 'WARNING': 0, 'ERROR': 0},
        'errors': [],
        'most_common_level': None
    }

def test_malformed_lines():
    logs = ['This is bad', 'Missing colon:', ': Missing level']
    summary = summarize_logs(logs)
    assert summary == {
        'counts': {'INFO': 0, 'WARNING': 0, 'ERROR': 0},
        'errors': [],
        'most_common_level': None
    }

def test_case_insensitive_levels():
    logs = ['info: Log info', 'Warning: Be careful']
    summary = summarize_logs(logs)
    assert summary == {
        'counts': {'INFO': 1, 'WARNING': 1, 'ERROR': 0},
        'errors': [],
        'most_common_level': 'INFO'
    }

def test_errors_only_extraction():
    logs = ['Error: bad thing', 'error: another error']
    summary = summarize_logs(logs)
    assert summary == {
        'counts': {'INFO': 0, 'WARNING': 0, 'ERROR': 2},
        'errors': ['bad thing', 'another error'],
        'most_common_level': 'ERROR'
    }

def test_tie_breaking():
    logs = ['Info: a', 'Warning: b', 'Error: c', 'Info: d']
    summary = summarize_logs(logs)
    assert summary == {
        'counts': {'INFO': 2, 'WARNING': 1, 'ERROR': 1},
        'errors': ['c'],
        'most_common_level': 'INFO'
    }

def test_messages_contain_colons():
    logs = ['Info: this is a:message', 'Warning: that:is:a:test']
    summary = summarize_logs(logs)
    assert summary == {
        'counts': {'INFO': 1, 'WARNING': 1, 'ERROR': 0},
        'errors': [],
        'most_common_level': 'INFO'
    }

def test_empty_error_messages():
    logs = ['Error:', 'info: This is an info message']
    summary = summarize_logs(logs)
    assert summary == {
        'counts': {'INFO': 1, 'WARNING': 0, 'ERROR': 0},
        'errors': [],
        'most_common_level': 'INFO'
    }

def test_unknown_levels():
    logs = ['DEBUG: This is debug', 'FOO: This is unknown']
    summary = summarize_logs(logs)
    assert summary == {
        'counts': {'INFO': 0, 'WARNING': 0, 'ERROR': 0},
        'errors': [],
        'most_common_level': None
    }
