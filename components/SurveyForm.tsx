"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SurveyFormProps {
  defaultValues?: {
    kodeSurvey?: string;
    alamat?: string;
    iddesa?: number;
    idkecamatan?: number;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function SurveyForm({ defaultValues = {}, onSubmit, onCancel }: SurveyFormProps) {
  const [formData, setFormData] = useState({
    kodeSurvey: "",
    alamat: "",
    iddesa: "",
    idkecamatan: "",
  });

  // Set value ketika edit
  useEffect(() => {
    setFormData({
      kodeSurvey: defaultValues.kodeSurvey || "",
      alamat: defaultValues.alamat || "",
      iddesa: defaultValues.iddesa?.toString() || "",
      idkecamatan: defaultValues.idkecamatan?.toString() || "",
    });
  }, [defaultValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const payload = {
      kodeSurvey: formData.kodeSurvey,
      alamat: formData.alamat,
      iddesa: Number(formData.iddesa),
      idkecamatan: Number(formData.idkecamatan),
    };
    onSubmit(payload);
  };

  return (
    <div className="space-y-3">
      <Input
        name="kodeSurvey"
        placeholder="Kode Survey"
        value={formData.kodeSurvey}
        onChange={handleChange}
      />
      <Input
        name="alamat"
        placeholder="Alamat"
        value={formData.alamat}
        onChange={handleChange}
      />
      <Input
        name="iddesa"
        placeholder="ID Desa"
        value={formData.iddesa}
        onChange={handleChange}
      />
      <Input
        name="idkecamatan"
        placeholder="ID Kecamatan"
        value={formData.idkecamatan}
        onChange={handleChange}
      />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Batal</Button>
        <Button onClick={handleSubmit}>Simpan</Button>
      </div>
    </div>
  );
}
