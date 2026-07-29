"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ROTULO_TIPO_EQUIPAMENTO, ROTULO_TIPO_OPERACAO } from "@/components/equipamento/rotulos";
import { useRepositorio } from "@/lib/data/context";
import type { TipoEquipamento, TipoOperacao } from "@/lib/types";

const OPCOES_TIPO: TipoEquipamento[] = ["empilhadeira", "reach_stacker", "transpaleteira"];
const OPCOES_OPERACAO: TipoOperacao[] = ["carga_geral", "conteineres", "graneis", "armazem"];

export default function NovoEquipamentoPage() {
  const repo = useRepositorio();
  const router = useRouter();

  const [tag, setTag] = useState("");
  const [tipo, setTipo] = useState<TipoEquipamento>("empilhadeira");
  const [tipoOperacao, setTipoOperacao] = useState<TipoOperacao>("carga_geral");
  const [modelo, setModelo] = useState("");
  const [localizacaoAtual, setLocalizacaoAtual] = useState("");
  const [erroTag, setErroTag] = useState<string | undefined>();

  const valido = tag.trim().length > 0 && modelo.trim().length > 0 && localizacaoAtual.trim().length > 0;

  function aoSalvar() {
    try {
      const equipamento = repo.equipamentos.criar({ tag, tipo, tipoOperacao, modelo, localizacaoAtual });
      router.push(`/equipamento/${equipamento.tag}`);
    } catch (erro) {
      setErroTag(erro instanceof Error ? erro.message : "Não foi possível cadastrar o equipamento.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader titulo="Novo equipamento" subtitulo="Cadastre a tag, o tipo e a operação — o QR e o checklist padrão são gerados automaticamente." />
      <Card densidade="densa" className="flex flex-col gap-4">
        <Input
          rotulo="Tag"
          placeholder="Ex.: EMP-05"
          value={tag}
          onChange={(e) => {
            setTag(e.target.value);
            setErroTag(undefined);
          }}
          erro={erroTag}
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select rotulo="Tipo de equipamento" value={tipo} onChange={(e) => setTipo(e.target.value as TipoEquipamento)}>
            {OPCOES_TIPO.map((valor) => (
              <option key={valor} value={valor}>
                {ROTULO_TIPO_EQUIPAMENTO[valor]}
              </option>
            ))}
          </Select>
          <Select
            rotulo="Tipo de operação"
            value={tipoOperacao}
            onChange={(e) => setTipoOperacao(e.target.value as TipoOperacao)}
          >
            {OPCOES_OPERACAO.map((valor) => (
              <option key={valor} value={valor}>
                {ROTULO_TIPO_OPERACAO[valor]}
              </option>
            ))}
          </Select>
        </div>
        <Input rotulo="Modelo" placeholder="Ex.: Toyota 8FD25" value={modelo} onChange={(e) => setModelo(e.target.value)} required />
        <Input
          rotulo="Localização atual"
          placeholder="Ex.: Pátio A — Fileira 1"
          value={localizacaoAtual}
          onChange={(e) => setLocalizacaoAtual(e.target.value)}
          required
        />
        <div className="flex justify-end gap-2">
          <Button variante="secondary" onClick={() => router.push("/admin/equipamentos")}>
            Cancelar
          </Button>
          <Button onClick={aoSalvar} disabled={!valido}>
            Cadastrar equipamento
          </Button>
        </div>
      </Card>
    </div>
  );
}
