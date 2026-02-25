from typing import List, Dict

def gale_shapley_match(users: List[Dict]) -> List[tuple]:
    """
    Implements a simplified Gale-Shapley stable matching algorithm.
    Pairs users based on compatibility scores (simulating preferences).
    
    Args:
        users: A list of user dictionaries containing 'id', 'major', 'career_interest'.
        
    Returns:
        List of tuples representing matched pairs: [(user1_id, user2_id, match_score)]
    """
    if len(users) < 2:
        return []

    # Simplified scoring: +50 for same major, +50 for same career interest
    def calculate_score(u1, u2):
        score = 0
        if u1.get('major') == u2.get('major'):
            score += 50
        if u1.get('career_interest') == u2.get('career_interest'):
            score += 50
        # Base compatibility for being in the same cohort
        if score == 0:
            score = 30
        return score

    # Generate preference lists for all users based on score
    preferences = {}
    for i, u1 in enumerate(users):
        prefs = []
        for j, u2 in enumerate(users):
            if i != j:
                score = calculate_score(u1, u2)
                prefs.append((u2['id'], score))
        # Sort preferences descending by score
        prefs.sort(key=lambda x: x[1], reverse=True)
        preferences[u1['id']] = [p[0] for p in prefs]

    matches = {} # Tracks who is matched with whom
    free_users = [u['id'] for u in users]

    while free_users:
        proposer = free_users.pop(0)
        
        if not preferences[proposer]:
            continue # Proposer has exhausted preferences

        # Propose to the top preference
        preferred_partner = preferences[proposer].pop(0)

        if preferred_partner not in matches:
            # Partner is free, they match
            matches[preferred_partner] = proposer
            # Need to remove the matched partner from free pool if they are there
            if preferred_partner in free_users:
                free_users.remove(preferred_partner)
        else:
            # Partner is already matched, evaluate preference
            current_match = matches[preferred_partner]
            partner_prefs = preferences[preferred_partner]
            
            # Find index in preference list (lower index is better)
            try:
                current_rank = partner_prefs.index(current_match)
                proposer_rank = partner_prefs.index(proposer)
            except ValueError:
                # If either isn't in pref list for some reason, keep current
                free_users.append(proposer)
                continue

            if proposer_rank < current_rank:
                # New proposer is preferred! Break old match.
                matches[preferred_partner] = proposer
                free_users.append(current_match)
            else:
                # Current match is preferred. Proposer is rejected.
                free_users.append(proposer)

    # Format output and calculate final scores
    final_matches = []
    processed = set()
    for partner, proposer in matches.items():
        if partner not in processed and proposer not in processed:
            # Find original user dicts for scoring
            u1 = next((u for u in users if u['id'] == partner), None)
            u2 = next((u for u in users if u['id'] == proposer), None)
            score = calculate_score(u1, u2) if u1 and u2 else 50
            final_matches.append((partner, proposer, score))
            processed.add(partner)
            processed.add(proposer)

    return final_matches
