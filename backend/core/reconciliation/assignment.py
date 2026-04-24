"""
Assignment — uses the Hungarian algorithm to find the optimal 1:1
matching between source and target tables/columns.
"""

from __future__ import annotations


def hungarian_assignment(
    score_matrix: list[list[dict]],
    threshold: float = 0.30,
) -> list[tuple[int, int, dict]]:
    if not score_matrix or not score_matrix[0]:
        return []

    n_rows = len(score_matrix)
    n_cols = len(score_matrix[0])

    cost = []
    for i in range(n_rows):
        row = []
        for j in range(n_cols):
            row.append(1.0 - score_matrix[i][j]["combined_score"])
        cost.append(row)

    try:
        row_indices, col_indices = _scipy_hungarian(cost, n_rows, n_cols)
    except Exception:
        row_indices, col_indices = _greedy_assignment(score_matrix, n_rows, n_cols)

    results = []
    for r, c in zip(row_indices, col_indices):
        if r < n_rows and c < n_cols:
            score_dict = score_matrix[r][c]
            if score_dict["combined_score"] >= threshold:
                results.append((r, c, score_dict))

    results.sort(key=lambda x: x[2]["combined_score"], reverse=True)
    return results


def _scipy_hungarian(
    cost: list[list[float]], n_rows: int, n_cols: int
) -> tuple[list[int], list[int]]:
    from scipy.optimize import linear_sum_assignment
    import numpy as np

    size = max(n_rows, n_cols)
    padded = np.ones((size, size))
    for i in range(n_rows):
        for j in range(n_cols):
            padded[i][j] = cost[i][j]

    row_ind, col_ind = linear_sum_assignment(padded)
    return row_ind.tolist(), col_ind.tolist()


def _greedy_assignment(
    score_matrix: list[list[dict]], n_rows: int, n_cols: int
) -> tuple[list[int], list[int]]:
    candidates = []
    for i in range(n_rows):
        for j in range(n_cols):
            candidates.append((score_matrix[i][j]["combined_score"], i, j))

    candidates.sort(key=lambda x: x[0], reverse=True)

    used_rows: set[int] = set()
    used_cols: set[int] = set()
    row_indices = []
    col_indices = []

    for score, r, c in candidates:
        if r not in used_rows and c not in used_cols:
            row_indices.append(r)
            col_indices.append(c)
            used_rows.add(r)
            used_cols.add(c)

    return row_indices, col_indices