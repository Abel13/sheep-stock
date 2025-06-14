import * as Print from 'expo-print';
import { formatCurrency } from '@/utils/currency';
import { ItemSale } from '@/types/ItemSale';
import { shareAsync } from 'expo-sharing';

export const useInvoice = () => {
  const print = async ({
    totalAmount,
    selectedItems,
    customerName,
    valuePaid,
  }: {
    totalAmount: number;
    selectedItems: ItemSale[];
    customerName: string;
    valuePaid: number;
  }) => {
    const html = `
                <html>
                  <head>
                    <meta charset="utf-8" />
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        padding: 0;
                        color: #333;
                      }
                      header {
                        text-align: center;
                        margin-bottom: 30px;
                      }
                      img {
                        max-width: 120px;
                        margin-bottom: 10px;
                      }
                      h1 {
                        font-size: 24px;
                        margin: 10px 0;
                      }
                      .info {
                        margin-bottom: 20px;
                        font-size: 16px;
                      }
                      .disclaimer {
                        color: #515151;
                        font-size: 12px;
                      }
                      table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                      }
                      table, th, td {
                        border: 1px solid #ddd;
                      }
                      th, td {
                        padding: 10px;
                        text-align: left;
                      }
                      th {
                        background-color: #f2f2f2;
                      }
                      .total {
                        text-align: right;
                        font-size: 18px;
                        font-weight: bold;
                      }
                    </style>
                  </head>
                  <body>
                    <header>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100"
                        height="100"
                        viewBox="2500 300 500 500"
                      >
                        <title>Espaço Natural - vetor</title>
                        <style>
                          .s0 { fill: #a8af8d }
                          .s1 { fill: #b9aacb }
                        </style>
                        <g>
                          <g id="Camada 1">
                            <g id="&lt;Group&gt;">
                              <g id="&lt;Group&gt;">
                                <g id="&lt;Group&gt;">
                                  <path id="&lt;Path&gt;" class="s0" d="m2722.4 472.8c-2.1-4.1-4.1-8-6-11.8h-23.6c4.3 8.3 8.9 17.2 13.6 26.3 9.6 18.5 20 38.2 30.9 57.2h24.8c-14.4-24.4-28.4-49.8-39.7-71.7z"/>
                                </g>
                                <g id="&lt;Group&gt;">
                                  <path id="&lt;Path&gt;" class="s0" d="m2698.7 643.7v-87.5h83.4v-4h-6.5-42.7-34.2v-63-24.1h28.4 63v-4h-65-40.9-6.8v186.6h115.4v-4z"/>
                                </g>
                                <g id="&lt;Group&gt;">
                                  <path id="&lt;Path&gt;" class="s0" d="m2837 641.1c-4.8-6.1-8.5-13-11-20.4-2.3-6.9-3.4-14.1-3.7-21.4-0.3-7.2 0.2-14.5 1.2-21.6 1-7 2.4-13.9 4-20.8 1.4-6.4 3-12.7 4.4-19.1 2.1-9.2 3.4-18.6 3.6-28q0.1-2.1 0.1-4.2c-0.1-10.3-1.5-20.4-4.3-30.3-1.2-4.4-2.4-8.8-4-13.1-3-8.4-7.6-16.2-10.2-24.8-1.2-4.1-1.9-8.4-1.7-12.7 0.2-2.8 0.7-5.7 1.7-8.3 1.4-3.9 3.8-7.4 7-9.9 2.7-2.2 5.9-3.7 9.3-4.7-0.6 0.9-1.1 1.9-1.4 2.9-4.9 14.8 7.8 23.8 3.1 35.2-1.9 4.2-6.2 7-9.9 9.7q-0.1 0.1-0.1 0.2c0.1 0.1 0.2 0.1 0.2 0.1 2.3-1 4.5-2 6.6-3.4 10.9-7.1 7.4-17.6 3.6-27.6-1.6-4.3-2-9-0.9-13.5 0.5-1.8 1.4-4.1 3.3-4.5q0.1-0.1 0.1-0.1c0.5 0 0.9-0.5 0.9-1-0.2-2.2-5.4 0.4-6.3 0.8q-4.9 1.9-9.1 5.1c-8.6 6.5-12.7 18-10.8 28.6 0.4 2.4 1 4.8 1.8 7-1.9-2.1-4-4-6-5.8-4.2-3.7-8.9-6.5-13.9-9-10.1-5-22.9-6.4-33.3-3.7-7.4 1.9-15.7 6.2-19.6 13.1-1.6 2.7-2.5 5.8-3.4 8.7-0.8 2.6-1.1 5.2-1.7 7.9-0.1 0.5 0.7 0.9 1.1 0.4 6.3-7.7 13.6-8.9 23.1-7.4 8.9 1 19.5-0.6 25.7-7.6 0.2-0.2 0-0.4-0.2-0.3-4 2.2-8.1 3.3-12.3 3.8-6.6 0.8-13.1-0.3-19.8 0-6.5 0.2-11.6 4.6-15.9 9.1 0.2-0.2 0.2-0.9 0.3-1.2q0.3-0.6 0.5-1.3 0.5-1.3 1.1-2.6c0.9-1.8 2.1-3.4 3.2-5 1.1-1.6 2.1-3.2 3.4-4.5 4.1-4.2 9.9-6.3 15.5-7.6 4.5-1 9.1-1.5 13.7-1.3q1.5 0.1 3.1 0.3c5.2 0.7 10.4 2.1 15.3 4.1 5.5 2.3 10.7 5.5 15.2 9.4 2.7 2.4 4.9 5.1 7 7.9 1.8 2.5 3.5 5.2 4.8 8q0.4 0.8 0.7 1.6c3.4 8 6.6 16.2 8.4 24.8 2.3 11.2 2.4 22.8 1.4 34.2q-0.5 5.5-1.4 10.9c-0.6-1.7-1.7-3.2-3.4-4.2-1.5-0.8-3.3-1-5-1.2-2.9-0.4-5.9-0.8-8.5-1.8-4-1.6-7-4.5-9.3-8.1-2.4-3.6-3.7-8.2-4.9-12.4-1.9-6-5.3-11.9-10.7-15.4q-3.8-2.7-7.9-4.8c7.2-2.2 15-1.3 22.2 0.9 8.3 2.5 16.6 6.8 21.4 14.3 1.6 2.5 2.7 5.3 3.4 8.3 0 0.1 0.1 0.2 0.2 0.2 0.1 0 0.3-0.1 0.3-0.2 0.1-3.2-0.5-6.4-1.8-9.4-6.4-14.5-26.3-22.1-41.3-19.5-3.4 0.6-6.8 1.8-9.8 3.5-0.1 0.1-0.1 0.1-0.4 0.4-1 0.9-0.5 2.7 0.7 3.1 4.1 1.3 8.2 2.7 12 4.8 1.3 0.7 2.5 1.6 3.6 2.5 3.3 3.1 5.4 7.4 6.3 11.7 0.7 4.8 1.1 9.5 3.4 13.9 4.1 8.2 11.9 11.4 20.7 11.6 0 0 2.3 0.1 2.3 0.1 2.6 0 4.4 2.4 5.1 4.8 0.4 1.3 0.4 2.5 0.1 3.9q-0.7 2.8-1.4 5.6c-1.3 4.7-2.7 9.3-4 14-3 10.9-5.8 21.9-7.3 33.2-1.7 14-1.5 29 4.8 41.9-13.3-13.7-30.3-38.2-47.4-66h-25.1c26.7 43.7 55.9 79.6 84 82.3 7.7 12.2 20.5 12.7 22.3 7.7 1.9-5.3-8.7-9.6-18.1-12.8z"/>
                                </g>
                              </g>
                              <g id="&lt;Group&gt;">
                                <g id="&lt;Group&gt;">
                                  <path id="&lt;Compound Path&gt;" fill-rule="evenodd" class="s1" d="m2764 745.9c-84.8 0-153.9-92.4-153.9-205.9 0-113.5 69.1-205.9 153.9-205.9 84.8 0 153.9 92.4 153.9 205.9 0 113.5-69.1 205.9-153.9 205.9zm0-407.2c-82.3 0-149.2 90.3-149.2 201.3 0 111 66.9 201.3 149.2 201.3 82.3 0 149.2-90.3 149.2-201.3 0-111-66.9-201.3-149.2-201.3z"/>
                                </g>
                                <g id="&lt;Group&gt;">
                                  <path id="&lt;Compound Path&gt;" fill-rule="evenodd" class="s1" d="m2764 745.9c-92.5 0-167.7-92.4-167.7-205.9 0-113.5 75.2-205.9 167.7-205.9 92.5 0 167.7 92.4 167.7 205.9 0 113.5-75.2 205.9-167.7 205.9zm0-407.2c-89.9 0-163.1 90.3-163.1 201.3 0 111 73.2 201.3 163.1 201.3 89.9 0 163.1-90.3 163.1-201.3 0-111-73.2-201.3-163.1-201.3z"/>
                                </g>
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>

                      <h1>Recibo de Compra</h1>
                      <span class="disclaimer">NÃO É CUPOM FISCAL</span>
                    </header>

                    <div class="info">
                      <p><strong>Cliente:</strong> ${customerName || '-'}</p>
                      <p><strong>Data:</strong> ${new Date().toLocaleDateString()}</p>
                      <p><strong>Valor pago:</strong> ${formatCurrency(valuePaid || 0)}</p>
                    </div>

                    <table>
                      <thead>
                        <tr>
                          <th>Itens</th>
                          <th>Quantidade</th>
                          <th>Preço Unitário</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${selectedItems
                          .map(
                            item => `
                          <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>R$ ${item.price?.toFixed(2) || 0}</td>
                            <td>R$ ${((item.price || 0) * item.quantity).toFixed(2)}</td>
                          </tr>
                        `,
                          )
                          .join('')}
                      </tbody>
                    </table>

                    <p class="total">TOTAL: R$ ${totalAmount.toFixed(2)}</p>
                  </body>
                </html>
              `;

    const { uri } = await Print.printToFileAsync({ html });

    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  };

  return {
    print,
  };
};
