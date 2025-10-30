
'use server';
/**
 * @fileOverview Um fluxo Genkit para sugerir correções para linhas de dados R2D2 inválidas.
 *
 * - suggestCorrection - A função principal que recebe uma linha inválida e retorna uma sugestão.
 * - SuggestionInput - O tipo de entrada para a função.
 * - SuggestionOutput - O tipo de saída para a função (uma string com a linha corrigida).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FieldRuleSchema = z.object({
  name: z.string(),
  type: z.enum(['C', 'N', 'D', 'T']),
  maxLength: z.number(),
  required: z.boolean(),
  decimals: z.number().optional(),
});

const SuggestionInputSchema = z.object({
  lineContent: z.string().describe('A linha original do arquivo que contém erros.'),
  recordType: z.string().describe('O tipo de registro da linha (ex: OP, IT, CL).'),
  rules: z.array(FieldRuleSchema).describe('O conjunto de regras de validação para este tipo de registro.'),
  errors: z.array(z.string()).describe('A lista de erros de validação encontrados para esta linha.'),
});

export type SuggestionInput = z.infer<typeof SuggestionInputSchema>;

export async function suggestCorrection(input: SuggestionInput): Promise<string> {
    const result = await suggestCorrectionFlow(input);
    return result.correctedLine;
}

const prompt = ai.definePrompt({
  name: 'suggestCorrectionPrompt',
  input: { schema: SuggestionInputSchema },
  output: { schema: z.object({ correctedLine: z.string() }) },
  prompt: `
    Você é um especialista em analisar e corrigir dados de arquivos de texto baseados em um layout específico (R2D2).
    Sua tarefa é corrigir uma única linha de dados que falhou na validação.

    **Layout e Contexto:**
    - O separador de campos é o ponto e vírgula (;).
    - Tipo 'C': Caractere (texto).
    - Tipo 'N': Numérico. O separador decimal deve ser o ponto (.). Não use separador de milhar.
    - Tipo 'D': Data, no formato AAAAMMDD.
    - Tipo 'T': Data e Hora, no formato AAAAMMDDHHMMSS.

    **Tarefa:**
    Analise a "Linha Original", os "Erros Encontrados" e as "Regras de Layout" para o tipo de registro informado.
    Gere uma "Linha Corrigida" que resolva TODOS os erros.
    
    **Diretrizes para Correção:**
    1.  **Número de Campos:** Se o número de campos estiver incorreto, ajuste a linha adicionando ou removendo ponto e vírgulas (;) para que o número de campos seja igual ao esperado pelas regras. Preencha campos obrigatórios ausentes com valores padrão lógicos (ex: 0 para números, data/hora atual para datas) e deixe campos não obrigatórios em branco.
    2.  **Tamanho Máximo:** Se um campo exceder o tamanho máximo, abrevie o valor de forma inteligente, mantendo sua essência.
    3.  **Tipo de Dado:** Corrija os formatos. Converta vírgulas para pontos em números. Formate datas e horas corretamente. Remova caracteres não numéricos de campos numéricos.
    4.  **Campos Obrigatórios:** Se um campo obrigatório estiver vazio, preencha com um valor padrão lógico. Por exemplo, para um campo 'Cancelado' (tipo N, valor 1 ou 0), '0' é um bom padrão. Para um 'Código de Filial', '0001' pode ser um padrão.
    5.  **Manter Dados:** Preserve ao máximo os dados originais que estão corretos. Altere apenas o que for necessário para corrigir os erros.
    6.  **Saída:** Sua resposta DEVE ser apenas a linha corrigida, sem nenhuma explicação adicional.

    ---

    **Tipo de Registro:**
    {{{recordType}}}

    **Regras de Layout (para este tipo de registro):**
    \`\`\`json
    {{{json stringify=rules}}}
    \`\`\`

    **Linha Original:**
    \`\`\`
    {{{lineContent}}}
    \`\`\`

    **Erros Encontrados:**
    {{#each errors}}
    - {{{this}}}
    {{/each}}

    ---

    Baseado estritamente nas informações acima, forneça a linha corrigida.
  `,
});


const suggestCorrectionFlow = ai.defineFlow(
  {
    name: 'suggestCorrectionFlow',
    inputSchema: SuggestionInputSchema,
    outputSchema: z.object({ correctedLine: z.string() }),
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
