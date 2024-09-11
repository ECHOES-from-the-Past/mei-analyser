# space optimized
def is_match(t, p):
    n = len(t)
    m = len(p)

    # Create two 1D arrays for current and previous rows
    prev = [False] * (m + 1)
    curr = [False] * (m + 1)

    # Empty pattern matches with empty string
    prev[0] = True

    # Handle patterns with '*' at the beginning
    for j in range(1, m + 1):
        if p[j - 1] == '*':
            prev[j] = prev[j - 1]

    for i in range(1, n + 1):

        # Empty pattern can't match non-empty string
        curr[0] = False

        for j in range(1, m + 1):

            # Characters match or '?' matches any character
            if p[j - 1] == t[i - 1] or p[j - 1] == '?':
                curr[j] = prev[j - 1]

            # '*' matches zero or more characters
            elif p[j - 1] == '*':
                curr[j] = curr[j - 1] or prev[j]
            else:
                curr[j] = False

        # Move to the next row
        prev = curr[:]
    print()
    return prev[m]


# Example usage
t = "cdsadjfke"
p = "c*e"
print("Yes" if is_match(t, p) else "No")
