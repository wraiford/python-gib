import unittest
import json
import hashlib
import sys
import os

# Adjust the Python path to include the root directory for absolute imports
# This allows 'from python_ibgib.ibgib_helper import ...' to work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.py_gib.V1.sha256v1 import sha256v1, to_normalized_for_hashing

# Helper function for tests (Python equivalent of hashToHexCopy)
def hash_to_hex_copy(message: str | bytes) -> str:
    if not message:
        return ""
    if isinstance(message, str):
        message_bytes = message.encode('utf-8')
    else:
        message_bytes = message

    # Ensure message_bytes is not empty after potential encoding of an empty string
    # (though initial `if not message:` should catch empty strings)
    if not message_bytes: # Handles cases like empty string that becomes empty bytes
        return ""

    h = hashlib.sha256()
    h.update(message_bytes)
    return h.hexdigest().upper()

class TestSha256V1(unittest.TestCase):
    # Test Data
    TEST_IBS = {"ib": "ib", "some_test_string_here": "Some test string here."}
    TEST_HASHES_SHA256_STRINGS = {
        "ib": "765DBB8C38A58A5DC019D7B3133DFFB251D643CB291328AD8E86D4F05655E68B",
        "Some test string here.": "E9D61315933F1E8ABCEAA51B2CDD711FBF63C82CBF8C359603907E6DED73DB30"
    }
    EMPTY_REL8NS = {}
    EMPTY_DATA = {}
    ROOT_IBGIB_ADDR = "ib^gib"
    DATA_FLAT_XY = {"x": 1, "y": 2}
    DATA_FLAT_XY_HASH = "689A8F1DB95402580476E38C264278CE7B1E664320CFB4E9AE8D3A908CF09964" # Matches TS `DATA_FLAT_XY_HASH_SHA256`
    DATA_FLAT_XS = {"x": 1, "s": "string here"}
    DATA_FLAT_XS_HASH = "EEE1367DC05EDA2D46B8BB7978856261256FC1F59A95E453D9EECA22D235EE54" # Matches TS `DATA_FLAT_XS_HASH_SHA256`
    REL8NS_SIMPLE = {
        "past": [ROOT_IBGIB_ADDR],
        "ancestor": [ROOT_IBGIB_ADDR],
        "dna": [ROOT_IBGIB_ADDR],
        "identity": [ROOT_IBGIB_ADDR]
    }
    REL8NS_SIMPLE_HASH = "FA54EECD9FB1B5C9D5FD63E5E59C8C6576D14610DB62129F863B3120F4A1A433" # Matches TS `REL8NS_SIMPLE_HASH_SHA256`

    TEST_IBGIBS_PYTHON = [
        {
            "ibgib": {
                "ib": TEST_IBS["ib"],
                "gib": "34F03B3EC694FBEE1F93944CF6BAD4B6A07FD450276B9FC1A523EB4C1E4157B7",
                "rel8ns": REL8NS_SIMPLE,
                "data": DATA_FLAT_XY,
            },
            "dataHash": DATA_FLAT_XY_HASH,
            "rel8nsHash": REL8NS_SIMPLE_HASH,
        },
        {
            "ibgib": {
                "ib": TEST_IBS["ib"],
                "gib": "577E5732B8E00539B5FBF27607E09496805BB113232C970958D8DF05BE6164B6",
                "rel8ns": REL8NS_SIMPLE,
                "data": DATA_FLAT_XS,
            },
            "dataHash": DATA_FLAT_XS_HASH,
            "rel8nsHash": REL8NS_SIMPLE_HASH,
        },
    ]

    def test_hash_internal_strings(self):
        """Corresponds to `test internal hash function ib: ${x}`."""
        for text, expected_hash in self.TEST_HASHES_SHA256_STRINGS.items():
            with self.subTest(text=text):
                self.assertEqual(hash_to_hex_copy(text), expected_hash)

    def test_hash_ibgibs_with_empty_falsy_data_rel8ns(self):
        """Corresponds to `should hash ibgibs with empty/null/undefined data/rel8ns consistently "forever"`."""
        ib = "ib"
        # This hash is derived from the TS test case:
        # ibHash = await hashToHex(ib); // 765DBB8C38A58A5DC019D7B3133DFFB251D643CB291328AD8E86D4F05655E68B
        # manualAllHash = await hashToHex(ibHash); // Since data/rel8ns are empty/falsy
        # manualAllHash = E975776B1A3E4468086E1D8C409116F6E098D13BEEDFE17AF668071B5D11CD55
        expected_hash = "E975776B1A3E4468086E1D8C409116F6E098D13BEEDFE17AF668071B5D11CD55"

        equivalents = [
            {"ib": ib, "rel8ns": self.EMPTY_REL8NS},
            {"ib": ib, "rel8ns": self.EMPTY_REL8NS, "data": self.EMPTY_DATA},
            {"ib": ib, "rel8ns": self.EMPTY_REL8NS, "data": None},
            {"ib": ib, "rel8ns": self.EMPTY_REL8NS}, # data key missing

            {"ib": ib, "rel8ns": None, "data": self.EMPTY_DATA},
            {"ib": ib, "rel8ns": None, "data": None},
            {"ib": ib, "rel8ns": None}, # data key missing

            {"ib": ib, "data": self.EMPTY_DATA}, # rel8ns key missing
            {"ib": ib, "data": None}, # rel8ns key missing
            {"ib": ib}, # data and rel8ns keys missing
        ]

        for i, ibgib_case in enumerate(equivalents):
            with self.subTest(case_index=i, ibgib=ibgib_case):
                self.assertEqual(sha256v1(ibgib_case), expected_hash)

    def test_hash_ibgibs_with_simple_data_rel8ns(self):
        """Corresponds to `should hash ibgibs with non-null data/rel8ns consistently "forever"`."""
        for i, test_case in enumerate(self.TEST_IBGIBS_PYTHON):
            with self.subTest(case_index=i, test_case_name=test_case["ibgib"].get("gib", f"case_{i}")):
                ib = test_case["ibgib"]["ib"]
                data = test_case["ibgib"]["data"]
                rel8ns = test_case["ibgib"]["rel8ns"]
                expected_gib = test_case["ibgib"]["gib"]
                expected_data_hash = test_case["dataHash"]
                expected_rel8ns_hash = test_case["rel8nsHash"]

                # Verify intermediate hashes
                normalized_data = to_normalized_for_hashing(data)
                current_data_hash = hash_to_hex_copy(json.dumps(normalized_data, sort_keys=True, separators=(',', ':')))
                self.assertEqual(current_data_hash, expected_data_hash, "Data hash mismatch")

                normalized_rel8ns = to_normalized_for_hashing(rel8ns)
                current_rel8ns_hash = hash_to_hex_copy(json.dumps(normalized_rel8ns, sort_keys=True, separators=(',', ':')))
                self.assertEqual(current_rel8ns_hash, expected_rel8ns_hash, "Rel8ns hash mismatch")

                ib_hash = hash_to_hex_copy(ib)
                # This is how the final hash is constructed if data or rel8ns are present
                manual_all_hash = hash_to_hex_copy(ib_hash + current_rel8ns_hash + current_data_hash)
                self.assertEqual(manual_all_hash, expected_gib, "Manual combined hash mismatch")

                # Verify sha256v1 function output
                calculated_gib_hash = sha256v1(test_case["ibgib"])
                self.assertEqual(calculated_gib_hash, expected_gib, "sha256v1 function output mismatch")

if __name__ == '__main__':
    unittest.main()
