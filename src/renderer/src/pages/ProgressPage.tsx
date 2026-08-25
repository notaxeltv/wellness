import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useProgressStore } from '@/store/useProgressStore';
import { formatIsoDate } from '@/lib/utils';

export default function ProgressPage() {
  const entries = useProgressStore((s) => s.entries);
  const addEntry = useProgressStore((s) => s.addEntry);

  const [peso, setPeso] = useState('');
  const [vita, setVita] = useState('');
  const [petto, setPetto] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const chartData = useMemo(
    () =>
      entries
        .filter((e) => e.pesoKg != null)
        .map((e) => ({
          data: new Date(`${e.data}T00:00:00`).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
          peso: e.pesoKg,
        })),
    [entries]
  );

  const handleSubmit = async () => {
    if (!peso && !vita && !petto && !note) {
      toast.error('Inserisci almeno un valore prima di salvare.');
      return;
    }
    setSaving(true);
    try {
      await addEntry({
        data: formatIsoDate(),
        pesoKg: peso ? Number(peso) : null,
        vitaCm: vita ? Number(vita) : null,
        pettoCm: petto ? Number(petto) : null,
        note: note || null,
      });
      setPeso('');
      setVita('');
      setPetto('');
      setNote('');
      toast.success('Rilevamento salvato');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Progressi</h1>
        <p className="text-muted-foreground">Monitora peso e misure per vedere i risultati nel tempo.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Andamento peso corporeo</CardTitle>
            <CardDescription>Ultimi rilevamenti registrati</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nessun dato ancora. Registra il tuo primo peso qui a destra.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="data" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nuovo rilevamento</CardTitle>
            <CardDescription>Registrato per oggi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Peso (kg)</Label>
              <Input type="number" step="0.1" value={peso} onChange={(e) => setPeso(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Girovita (cm)</Label>
              <Input type="number" step="0.1" value={vita} onChange={(e) => setVita(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Torace (cm)</Label>
              <Input type="number" step="0.1" value={petto} onChange={(e) => setPetto(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Note</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Salvataggio…' : 'Salva rilevamento'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cronologia</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun rilevamento registrato.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2">Data</th>
                  <th className="py-2">Peso</th>
                  <th className="py-2">Vita</th>
                  <th className="py-2">Torace</th>
                  <th className="py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {[...entries].reverse().map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50">
                    <td className="py-2">{entry.data}</td>
                    <td className="py-2">{entry.pesoKg != null ? `${entry.pesoKg} kg` : '—'}</td>
                    <td className="py-2">{entry.vitaCm != null ? `${entry.vitaCm} cm` : '—'}</td>
                    <td className="py-2">{entry.pettoCm != null ? `${entry.pettoCm} cm` : '—'}</td>
                    <td className="py-2 text-muted-foreground">{entry.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
