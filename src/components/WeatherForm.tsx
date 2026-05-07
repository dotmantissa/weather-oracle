import { Spinner } from './Spinner';

type WeatherFormProps = {
  city: string;
  onCityChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  disabled: boolean;
  isLoading: boolean;
};

export const WeatherForm = ({ city, onCityChange, onSubmit, disabled, isLoading }: WeatherFormProps) => (
  <div className="space-y-4">
    <label className="block text-sm font-medium text-zinc-700" htmlFor="city-input">
      City
    </label>
    <input
      id="city-input"
      type="text"
      value={city}
      onChange={(event) => onCityChange(event.target.value)}
      placeholder="e.g. Lagos"
      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
      disabled={disabled || isLoading}
    />
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled || isLoading}
      onClick={() => {
        void onSubmit();
      }}
    >
      {isLoading ? (
        <>
          <Spinner />
          Fetching Weather...
        </>
      ) : (
        'Fetch Weather'
      )}
    </button>
  </div>
);
