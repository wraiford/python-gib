# python_ibgib/ibgib_helper.py

from typing import Any
import hashlib
import json

def to_normalized_for_hashing(obj: Any) -> Any:
    """
    Normalizes an object for hashing, similar to the ibgib-ts implementation.
    Sorts dictionary keys alphabetically and removes keys with None values.

    - None input returns None.
    - Strings are returned as is (being immutable).
    - Lists are shallow copied (their elements are not deeply normalized by this specific step,
      matching TypeScript's obj.concat() for arrays).
    - Other non-dict types (int, float, bool, tuple, set, etc.) are returned as is.
    - Dictionaries are deeply normalized:
        - Keys are sorted alphabetically.
        - Key-value pairs where value is None are excluded.
        - Values that are dicts or lists are recursively passed to to_normalized_for_hashing.
    """
    if obj is None:
        return None

    if isinstance(obj, str):
        return obj
    if isinstance(obj, list):
        return obj[:]

    if not isinstance(obj, dict):
        return obj

    normalized_dict = {}
    sorted_keys = sorted(obj.keys())

    for key in sorted_keys:
        value = obj[key]
        if value is not None:
            if isinstance(value, dict) or isinstance(value, list):
                normalized_dict[key] = to_normalized_for_hashing(value)
            else:
                normalized_dict[key] = value
                
    return normalized_dict

# Helper function for sha256v1
def _hash_to_hex(message: Any) -> str:
    """
    Computes SHA256 hash and returns uppercase hex digest.
    Returns "" for None, empty string, or empty bytes.
    Input `message` can be str or bytes.
    """
    if not message:  # Handles None, empty string, empty bytes
        return ""
    
    data_to_hash: bytes
    if isinstance(message, bytes):
        data_to_hash = message
    elif isinstance(message, str):
        data_to_hash = message.encode('utf-8')
    else:
        # This case should ideally not be reached if inputs are validated upstream
        # or are of expected types (str/bytes after JSON stringification).
        return "" 

    # Ensure that after encoding or if it was initially bytes, it's not empty.
    # e.g. if an empty string was passed and encoded.
    # However, `if not message:` at the start handles empty strings already.
    # If `message` was non-empty string but encoded to empty bytes (e.g. weird unicode),
    # this check might be relevant, but typically `encode()` on non-empty string
    # produces non-empty bytes.
    # For safety, checking `data_to_hash` might be redundant due to initial check.
    # The first `if not message:` covers empty strings and empty bytes.
    # Let's assume valid non-empty string/bytes make it here.

    hasher = hashlib.sha256()
    hasher.update(data_to_hash)
    return hasher.hexdigest().upper()

def sha256v1(ib_gib: dict) -> str:
    """
    Replicates the no-salt version of the TypeScript sha256v1 function.
    Computes a deterministic SHA256 hash for an ib_gib dictionary structure.
    """
    ib = ib_gib.get('ib')
    data = ib_gib.get('data')
    rel8ns = ib_gib.get('rel8ns')

    # Determine has_rel8ns
    # True if rel8ns is a non-empty dict and at least one of its values is a non-empty list.
    has_rel8ns = False
    if rel8ns and isinstance(rel8ns, dict): # Ensure rel8ns is not None and is a dict
        for value in rel8ns.values():
            if isinstance(value, list) and len(value) > 0:
                has_rel8ns = True
                break
    
    # Determine has_data
    # True if data is present and not an empty string or empty dict. Bytes are always data.
    has_data = False
    if data is not None:
        if isinstance(data, str):
            has_data = len(data) > 0
        elif isinstance(data, bytes):
            # In TS, `data instanceof Uint8Array` sets `hasData = true` regardless of length.
            has_data = True 
        elif isinstance(data, dict):
            has_data = bool(data) # True if dict is not empty
        else:
            # Other types (numbers, booleans, etc.) are considered data if not None.
            has_data = True 

    ib_hash = _hash_to_hex(ib)

    rel8ns_hash = ""
    if has_rel8ns:
        normalized_rel8ns = to_normalized_for_hashing(rel8ns)
        # Compact JSON string with sorted keys
        json_rel8ns = json.dumps(normalized_rel8ns, sort_keys=True, separators=(',', ':'))
        rel8ns_hash = _hash_to_hex(json_rel8ns)

    data_hash = ""
    if has_data:
        if isinstance(data, bytes):
            data_hash = _hash_to_hex(data) # Hash bytes directly
        else:
            normalized_data = to_normalized_for_hashing(data)
            json_data = json.dumps(normalized_data, sort_keys=True, separators=(',', ':'))
            data_hash = _hash_to_hex(json_data)

    # Calculate final combined hash
    # If there's data or rel8ns, concatenate hashes and hash again.
    # Otherwise, hash the ib_hash again.
    if has_data or has_rel8ns:
        combined_content = ib_hash + rel8ns_hash + data_hash
        all_hash = _hash_to_hex(combined_content)
    else:
        # TS: (await hashToHex(ibHash)).toUpperCase()
        # This means if only 'ib' contributes, its hash is hashed again.
        all_hash = _hash_to_hex(ib_hash)
        
    return all_hash
