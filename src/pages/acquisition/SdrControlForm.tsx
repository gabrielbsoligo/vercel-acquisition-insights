
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertSdrControlData, fetchSdrNames, SdrControlFormData } from "@/services/sdrControlService";
import { Separator } from "@/components/ui/separator";

// Create schema for form validation
const formSchema = z.object({
  Data: z.string().min(1, "A data é obrigatória"),
  SDR: z.string().min(1, "Nome do SDR é obrigatório"),
  "Empresas Ativadas": z.coerce.number().int().nonnegative().optional().default(0),
  "Ligações Realizadas": z.coerce.number().int().nonnegative().optional().default(0),
  "Ligações Atendidas": z.coerce.number().int().nonnegative().optional().default(0),
  "Marcadas Out": z.coerce.number().int().nonnegative().optional().default(0),
  "Marcadas Recom": z.coerce.number().int().nonnegative().optional().default(0),
  "Marcadas Inbound": z.coerce.number().int().nonnegative().optional().default(0),
  "Show Out": z.coerce.number().int().nonnegative().optional().default(0),
  "Show Recom": z.coerce.number().int().nonnegative().optional().default(0),
  "Show Inbound": z.coerce.number().int().nonnegative().optional().default(0),
  "Noshow": z.coerce.number().int().nonnegative().optional().default(0),
  "Remarcadas": z.coerce.number().int().nonnegative().optional().default(0),
  "Recomendações Coletadas": z.coerce.number().int().nonnegative().optional().default(0),
  "Novas Conexões Stakeholder": z.coerce.number().int().nonnegative().optional().default(0),
  "Tempo": z.coerce.number().int().nonnegative().optional().default(0),
});

type FormValues = z.infer<typeof formSchema>;

const SdrControlForm = () => {
  const [sdrNames, setSdrNames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Data: format(new Date(), "yyyy-MM-dd"),
      SDR: "",
      "Empresas Ativadas": 0,
      "Ligações Realizadas": 0,
      "Ligações Atendidas": 0,
      "Marcadas Out": 0,
      "Marcadas Recom": 0,
      "Marcadas Inbound": 0,
      "Show Out": 0,
      "Show Recom": 0,
      "Show Inbound": 0,
      "Noshow": 0,
      "Remarcadas": 0,
      "Recomendações Coletadas": 0,
      "Novas Conexões Stakeholder": 0,
      "Tempo": 0,
    }
  });

  // Load SDR names on component mount
  useEffect(() => {
    const loadSdrNames = async () => {
      const names = await fetchSdrNames();
      setSdrNames(names);
    };
    
    loadSdrNames();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Convert form values to the format expected by the service
      const formData: SdrControlFormData = {
        Data: data.Data,
        SDR: data.SDR,
        "Empresas Ativadas": data["Empresas Ativadas"] || 0,
        "Ligações Realizadas": data["Ligações Realizadas"] || 0,
        "Ligações Atendidas": data["Ligações Atendidas"] || 0,
        "Marcadas Out": data["Marcadas Out"] || 0,
        "Marcadas Recom": data["Marcadas Recom"] || 0,
        "Marcadas Inbound": data["Marcadas Inbound"] || 0,
        "Show Out": data["Show Out"] || 0,
        "Show Recom": data["Show Recom"] || 0,
        "Show Inbound": data["Show Inbound"] || 0,
        "Noshow": data["Noshow"] || 0,
        "Remarcadas": data["Remarcadas"] || 0,
        "Recomendações Coletadas": data["Recomendações Coletadas"] || 0,
        "Novas Conexões Stakeholder": data["Novas Conexões Stakeholder"] || 0,
        "Tempo": data["Tempo"] || 0
      };
      
      const success = await insertSdrControlData(formData);
      
      if (success) {
        // Reset form after successful submission
        form.reset({
          Data: format(new Date(), "yyyy-MM-dd"),
          SDR: data.SDR, // Keep the same SDR for consecutive entries
          "Empresas Ativadas": 0,
          "Ligações Realizadas": 0,
          "Ligações Atendidas": 0,
          "Marcadas Out": 0,
          "Marcadas Recom": 0,
          "Marcadas Inbound": 0,
          "Show Out": 0,
          "Show Recom": 0,
          "Show Inbound": 0,
          "Noshow": 0,
          "Remarcadas": 0,
          "Recomendações Coletadas": 0,
          "Novas Conexões Stakeholder": 0,
          "Tempo": 0,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Controle Pré Venda - Formulário</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Date Field */}
                  <FormField
                    control={form.control}
                    name="Data"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(new Date(field.value), "dd/MM/yyyy") : (
                                  <span>Selecione a data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SDR Field */}
                  <FormField
                    control={form.control}
                    name="SDR"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SDR</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione ou digite o nome do SDR" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sdrNames.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                            <SelectItem value="Jenni">Jenni</SelectItem>
                            <SelectItem value="Gabi">Gabi</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                {/* Empresas Ativadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="Empresas Ativadas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresas Ativadas</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Novas Conexões Stakeholder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Novas Conexões Stakeholder</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                {/* Ligações section */}
                <h3 className="text-lg font-medium">Ligações</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="Ligações Realizadas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ligações Realizadas</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Ligações Atendidas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ligações Atendidas</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Tempo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempo Total em Linha (segundos)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormDescription>
                          Tempo total em segundos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                {/* Reuniões Marcadas section */}
                <h3 className="text-lg font-medium">Reuniões Marcadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="Marcadas Out"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marcadas Out</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Marcadas Recom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marcadas Recom</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Marcadas Inbound"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marcadas Inbound</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                {/* Reuniões Acontecidas section */}
                <h3 className="text-lg font-medium">Reuniões Acontecidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="Show Out"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Show Out</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Show Recom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Show Recom</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Show Inbound"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Show Inbound</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                {/* Outros dados section */}
                <h3 className="text-lg font-medium">Outros Dados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="Noshow"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No-show</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Remarcadas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarcadas</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Recomendações Coletadas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recomendações Coletadas</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SdrControlForm;
