import importlib
import sys
import types


class FakePublic:
    @staticmethod
    def write(fn):
        return fn

    @staticmethod
    def view(fn):
        return fn


class FakeEq:
    @staticmethod
    def strict_eq(fn):
        return fn()


def install_fake_genlayer(render_fn, exec_prompt_fn):
    fake_gl = types.SimpleNamespace(
        Contract=object,
        public=FakePublic(),
        eq_principle=FakeEq(),
        nondet=types.SimpleNamespace(
            web=types.SimpleNamespace(render=render_fn),
            exec_prompt=exec_prompt_fn,
        ),
    )

    module = types.ModuleType("genlayer")
    module.gl = fake_gl
    module.TreeMap = dict
    module.u256 = int

    sys.modules["genlayer"] = module


def load_contract(render_fn, exec_prompt_fn):
    install_fake_genlayer(render_fn, exec_prompt_fn)
    if "contracts.weather_oracle" in sys.modules:
        del sys.modules["contracts.weather_oracle"]
    return importlib.import_module("contracts.weather_oracle")


def test_fetch_temp_stores_offset_temperature():
    render_calls = []

    def render(url, mode="text"):
        render_calls.append((url, mode))
        return "Paris: +15C"

    def exec_prompt(_task):
        return '{"temp_val": 15}'

    contract_mod = load_contract(render, exec_prompt)
    oracle = contract_mod.WeatherOracle()
    oracle.temperatures = {}

    result = oracle.fetch_temp("Paris")

    assert result is None
    assert oracle.temperatures["Paris"] == 1015
    assert render_calls[0][0] == "https://wttr.in/Paris?format=3"
    assert render_calls[0][1] == "text"


def test_fetch_temp_handles_multiword_city_and_invalid_data():
    render_calls = []

    def render(url, mode="text"):
        render_calls.append((url, mode))
        return "Unknown location"

    def exec_prompt(_task):
        return '{"temp_val": null}'

    contract_mod = load_contract(render, exec_prompt)
    oracle = contract_mod.WeatherOracle()
    oracle.temperatures = {}

    result = oracle.fetch_temp("New York")

    assert result is None
    assert "New York" not in oracle.temperatures
    assert render_calls[0][0] == "https://wttr.in/New+York?format=3"


def test_get_last_temp_returns_value_and_missing_sentinel():
    def render(_url, mode="text"):
        return "Lagos: +28C"

    def exec_prompt(_task):
        return '{"temp_val": 28}'

    contract_mod = load_contract(render, exec_prompt)
    oracle = contract_mod.WeatherOracle()
    oracle.temperatures = {"Lagos": 1028}

    assert oracle.get_last_temp("Lagos") == 28
    assert oracle.get_last_temp("Berlin") == -999


def test_fetch_temp_handles_prompt_parse_error():
    def render(_url, mode="text"):
        return "Tokyo: +21C"

    def exec_prompt(_task):
        return "not-json"

    contract_mod = load_contract(render, exec_prompt)
    oracle = contract_mod.WeatherOracle()
    oracle.temperatures = {}

    result = oracle.fetch_temp("Tokyo")

    assert result is None
    assert "Tokyo" not in oracle.temperatures
