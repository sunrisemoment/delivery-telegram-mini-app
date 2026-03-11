import { useState } from "react";

interface DeliveryProofFormProps {
  onSubmit: (file: File, lat?: number, lng?: number) => Promise<void>;
}

export const DeliveryProofForm = ({ onSubmit }: DeliveryProofFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError("Proof photo is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(file, lat ? Number(lat) : undefined, lng ? Number(lng) : undefined);
      setFile(null);
      setLat("");
      setLng("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3" onSubmit={handleSubmit}>
      <label className="block text-sm font-semibold text-slate-700">Delivery proof photo</label>
      <input
        type="file"
        accept="image/*"
        required
        onChange={(event) => setFile(event.target.files?.[0] || null)}
        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
          placeholder="Lat (optional)"
          value={lat}
          onChange={(event) => setLat(event.target.value)}
        />
        <input
          className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
          placeholder="Lng (optional)"
          value={lng}
          onChange={(event) => setLng(event.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-mint-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-mint-700 disabled:opacity-60"
      >
        {submitting ? "Uploading..." : "Mark Delivered"}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </form>
  );
};
