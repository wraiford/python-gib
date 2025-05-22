from typing import List, Dict, Any

def foo(name: str, age: int, aliases: List[str]) -> Dict[str, Any]:
  """
  Processes and returns user information.

  Args:
    name: The user's name.
    age: The user's age.
    aliases: A list of the user's aliases.

  Returns:
    A dictionary containing the user's name, age, and aliases.
  """
  return {
      "name": name,
      "age": age,
      "aliases": aliases,
  }
