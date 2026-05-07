# v0.1.0
# { "Depends": "py-genlayer:latest" }

from genlayer import *
import json


class WeatherOracle(gl.Contract):
    """
    A decentralized Weather Oracle using wttr.in for reliable text data.
    """

    # Stores: City Name -> Temperature (Offset by +1000)
    # Example: 25C is stored as 1025. -5C is stored as 995.
    temperatures: TreeMap[str, u256]

    def __init__(self):
        pass

    @gl.public.write
    def fetch_temp(self, city: str) -> None:
        """
        Fetches temperature from wttr.in.
        Returns NONE to avoid simulator BigInt serialization crashes.
        Check 'get_last_temp' to see the result.
        """

        safe_city = city.replace(" ", "+")
        url = f"https://wttr.in/{safe_city}?format=3"

        def get_consensus_weather() -> int:
            print(f"Fetching: {url}")
            try:
                raw_text = gl.nondet.web.render(url, mode="text")
                print(f"Raw response: {raw_text}")
            except Exception as e:
                print(f"Fetch failed: {e}")
                return -999

            task = f"""
            Analyze this weather report: \"{raw_text}\"

            Goal: Extract the temperature in Celsius.
            The format is usually \"City: +12C\" or \"City: -5C\".

            Instructions:
            1. Find the number.
            2. Return it as an integer (e.g. 12, -5).
            3. If the text is an error or not found, return null.

            Respond using ONLY JSON:
            {{ \"temp_val\": int | null }}
            """

            result_raw = gl.nondet.exec_prompt(task)

            try:
                cleaned = result_raw.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(cleaned)
                val = parsed.get("temp_val")

                if val is None:
                    return -999
                return int(val)
            except Exception:
                return -999

        final_temp = gl.eq_principle.strict_eq(get_consensus_weather)

        if final_temp == -999:
            print(f"Could not get valid temp for {city}")
            return None

        self.temperatures[city] = u256(final_temp + 1000)

        return None

    @gl.public.view
    def get_last_temp(self, city: str) -> int:
        """
        Returns the temperature in Celsius.
        Returns -999 if no data exists.
        """
        if city in self.temperatures:
            val = int(self.temperatures[city])
            return val - 1000
        return -999
