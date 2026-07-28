"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ManualTagEntry({ onConfirmar }: { onConfirmar: (tag: string) => void }) {
  const [tag, setTag] = useState("");

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (tag.trim()) onConfirmar(tag.trim());
      }}
    >
      <Input
        rotulo="Tag do equipamento"
        placeholder="Ex.: EMP-01"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        autoFocus
        required
      />
      <Button type="submit" tamanho="lg" larguraTotal disabled={!tag.trim()}>
        Continuar
      </Button>
    </form>
  );
}
