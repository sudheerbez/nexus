from typing import List, Dict

# Named constants for matching algorithm
DEFAULT_COMPATIBILITY_SCORE = 30
STOP_WORDS = {'and', 'or', 'the', 'a', 'an', 'in', 'of', 'for', 'to', 'with'}


def gale_shapley_match(users: List[Dict]) -> List[tuple]:
    """
    Implements a simplified Gale-Shapley stable matching algorithm.
    Pairs users based on compatibility scores derived from real profile data.
    
    Args:
        users: A list of user dictionaries containing 'id', 'major', 'career_interest',
               and optionally 'learning_style', 'preferred_schedule', 'current_stage'.
        
    Returns:
        List of tuples representing matched pairs: [(user1_id, user2_id, match_score)]
    """
    if len(users) < 2:
        return []

    def calculate_score(u1, u2):
        """Calculate compatibility score (0-100) based on multiple real factors."""
        score = 0
        max_score = 0

        # Same major: strong academic alignment (25 points)
        max_score += 25
        if u1.get('major') and u2.get('major'):
            if u1['major'].lower() == u2['major'].lower():
                score += 25
            elif _has_overlap(u1['major'], u2['major']):
                score += 15

        # Same career interest: strong motivation alignment (25 points)
        max_score += 25
        if u1.get('career_interest') and u2.get('career_interest'):
            if u1['career_interest'].lower() == u2['career_interest'].lower():
                score += 25
            elif _has_overlap(u1['career_interest'], u2['career_interest']):
                score += 15

        # Compatible learning styles: complementary pairs work well (20 points)
        max_score += 20
        style1 = u1.get('learning_style', '')
        style2 = u2.get('learning_style', '')
        if style1 and style2:
            if style1 == style2:
                score += 20  # Same style = easy collaboration
            elif _complementary_styles(style1, style2):
                score += 15  # Complementary styles = mutual growth

        # Same preferred schedule: practical meeting compatibility (15 points)
        max_score += 15
        sched1 = u1.get('preferred_schedule', '')
        sched2 = u2.get('preferred_schedule', '')
        if sched1 and sched2 and sched1 == sched2:
            score += 15

        # Similar learning stage: peer learning effectiveness (15 points)
        max_score += 15
        stage1 = u1.get('current_stage', '')
        stage2 = u2.get('current_stage', '')
        if stage1 and stage2:
            stages = ['Dependent', 'Interested', 'Involved', 'Self-Directed']
            try:
                idx1 = stages.index(stage1)
                idx2 = stages.index(stage2)
                diff = abs(idx1 - idx2)
                if diff == 0:
                    score += 15  # Same stage
                elif diff == 1:
                    score += 10  # Adjacent stages

            except ValueError:
                pass

        # Normalize to percentage (0-100)
        return round((score / max_score) * 100) if max_score > 0 else DEFAULT_COMPATIBILITY_SCORE

    def _has_overlap(s1, s2):
        """Check if two strings share meaningful keywords."""
        words1 = set(s1.lower().split())
        words2 = set(s2.lower().split())
        words1 -= STOP_WORDS
        words2 -= STOP_WORDS
        return len(words1 & words2) > 0

    def _complementary_styles(s1, s2):
        """Check if learning styles are complementary."""
        complementary_pairs = {
            frozenset({'visual', 'hands-on'}),
            frozenset({'reading', 'collaborative'}),
            frozenset({'visual', 'reading'}),
            frozenset({'hands-on', 'collaborative'}),
        }
        return frozenset({s1, s2}) in complementary_pairs

    # Generate preference lists for all users based on score
    preferences = {}
    scores_cache = {}
    for i, u1 in enumerate(users):
        prefs = []
        for j, u2 in enumerate(users):
            if i != j:
                pair_key = (min(u1['id'], u2['id']), max(u1['id'], u2['id']))
                if pair_key not in scores_cache:
                    scores_cache[pair_key] = calculate_score(u1, u2)
                score = scores_cache[pair_key]
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
            pair_key = (min(partner, proposer), max(partner, proposer))
            score = scores_cache.get(pair_key, 50)
            final_matches.append((partner, proposer, score))
            processed.add(partner)
            processed.add(proposer)

    return final_matches
