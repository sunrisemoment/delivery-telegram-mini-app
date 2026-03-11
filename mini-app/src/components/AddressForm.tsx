import { useState } from "react";
import { AddressInput } from "../types";

interface AddressFormProps {
  onSubmit: (address: AddressInput) => void;
}

export const AddressForm = ({ onSubmit }: AddressFormProps) => {
  const [form, setForm] = useState<AddressInput>({
    addressLine1: "",
    addressLine2: "",
    city: "Atlanta",
    state: "GA",
    zipCode: "",
    isDefault: true,
  });

  return (
    <form
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <h3 className="font-display text-lg text-slate-900">Delivery Address</h3>
      <input
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
        placeholder="Address line 1"
        required
        value={form.addressLine1}
        onChange={(event) => setForm((current) => ({ ...current, addressLine1: event.target.value }))}
      />
      <input
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
        placeholder="Address line 2"
        value={form.addressLine2}
        onChange={(event) => setForm((current) => ({ ...current, addressLine2: event.target.value }))}
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          placeholder="City"
          value={form.city}
          onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
        />
        <input
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          placeholder="State"
          value={form.state}
          onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
        />
        <input
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
          placeholder="ZIP"
          value={form.zipCode}
          onChange={(event) => setForm((current) => ({ ...current, zipCode: event.target.value }))}
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
      >
        Save address for this order
      </button>
    </form>
  );
};
