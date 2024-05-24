import aspose from 'aspose.cells';
import fs from 'fs';
import { PDFDocument, rgb } from 'pdf-lib';
import ExcelJS from 'exceljs';

async function replacePlaceholders(inputFilePath, outputFilePath, data) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputFilePath);

    workbook.eachSheet((worksheet, sheetId) => {
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                if (cell.type === ExcelJS.ValueType.String) {
                    Object.keys(data).forEach(key => {
                        const placeholder = `%${key}%`;
                        if (cell.value.includes(placeholder)) {
                            cell.value = cell.value.replace(new RegExp(placeholder, 'g'), data[key]);
                        }
                    });
                }
            });
        });
    });

    await workbook.xlsx.writeFile(outputFilePath);
}


async function convertExcelToPdf(inputFilePath, outputFilePath) {
    const workbook = new aspose.Workbook(inputFilePath);
    workbook.save(outputFilePath, aspose.SaveFormat.PDF);
}

async function drawWhiteRectangle(inputFilePath, outputFilePath) {
    // Load the existing PDF
    const existingPdfBytes = fs.readFileSync(inputFilePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; 

    const topMargin = 28.35; // 1 cm in points (1 cm = 28.35 points)
    const width = firstPage.getWidth();
    const height = firstPage.getHeight();

    firstPage.drawRectangle({
        x: 0,
        y: height - topMargin,
        width,
        height: topMargin,
        color: rgb(1, 1, 1), // White color
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFilePath, pdfBytes);
}

async function keepOnlyFirstPage(inputFilePath, outputFilePath) {
    // Load the existing PDF
    const existingPdfBytes = fs.readFileSync(inputFilePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Remove all pages except the first one
    for (let i = pdfDoc.getPageCount() - 1; i > 0; i--) {
        pdfDoc.removePage(i);
    }

    // Create a new PDF document with only the first page
    const newPdfBytes = await pdfDoc.save();

    // Write the modified PDF to a file
    fs.writeFileSync(outputFilePath, newPdfBytes);
}

function makeStringFileNameSafe(fileName) {
    return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}


async function generateInvoicePipeline(invoiceNumber, invoiceData) {
    // generate corresponding file names for intermediate files, final file should be named as invoiceNumber.pdf in /invoices folder
    // input file will always be the template file ./template.xlsx
    // pipeline will finally clean up all intermediate files and only keep the final file
    // if any error occurs during the pipeline, it should be caught and logged, and the intermediate files should be cleaned up
    // interim files should be palced in /temp folder

    const inputFilePath = `./template.xlsx`;
    const dataUpdatedFilePath = `./temp/${makeStringFileNameSafe(invoiceNumber)}-data-updated.xlsx`;
    const pdfFilePath = `./temp/${makeStringFileNameSafe(invoiceNumber)}-output.pdf`;
    const finalPdfFilePath = `./invoices/${makeStringFileNameSafe(invoiceNumber)}.pdf`;

    try {
        await replacePlaceholders(inputFilePath, dataUpdatedFilePath, invoiceData);
        await convertExcelToPdf(dataUpdatedFilePath, pdfFilePath);
        await drawWhiteRectangle(pdfFilePath, pdfFilePath);
        await keepOnlyFirstPage(pdfFilePath, finalPdfFilePath);
    } catch (e) {
        console.error("Error during pipeline:", e);
    } finally {
        fs.unlinkSync(dataUpdatedFilePath);
        fs.unlinkSync(pdfFilePath);
    }

    console.log("Pipeline completed for invoice:", invoiceNumber);
}

const data = {
    INVOICE_NUMBER: '123456',
    INVOICE_DATE: '2024-05-24',
    CUSTOMER_NAME: 'John Doe',
    CUSTOMER_ADDRESS: '123 Main St, Anytown, USA',
    CUSTOMER_PHONE: '+91 999999999',
    CUSTOMER_EMAIL: 'john.doe@example.com'
};


const main = async () => {
    generateInvoicePipeline('1234567', data)
}

// main().then(() => {
//     console.log("Conversion complete");
// }).catch((e) => {
//     console.error("Error during conversion:", e);
// })

function buildObjectFromArray(items) {
    const maxItems = 15; // Maximum number of items allowed
    const itemKeys = [
        'ITEM_NO',
        'ITEM_DESCRIPTION',
        'ITEM_HSN',
        'ITEM_QTY',
        'ITEM_UNIT_PRICE',
        'ITEM_TOTAL_PRICE',
        'ITEM_CGST',
        'ITEM_SGST',
        'ITEM_IGST',
        'ITEM_TAX',
        'ITEM_TOTAL'
    ];
    
    const result = {};

    // Ensure the array has at most `maxItems` elements

    for (let i = 0; i < 15; i++) {
        const item = items[i];
        itemKeys.forEach((key, index) => {
            const placeholderKey = `ITEM_${i + 1}_${key}`;
            try {
                result[placeholderKey] = item[key] || ''; // Set the value to an empty string if the key doesn't exist in the item
            } catch (e) {
                result[placeholderKey] = '';
            }
        });
    }

    return result;
}


const dummyDataRequest = {
    invoiceNumber: '123456',
    items: [
        { ITEM_NO: '1', ITEM_DESCRIPTION: 'Description 1', ITEM_HSN: '123456', ITEM_QTY: '1', ITEM_UNIT_PRICE: '10', ITEM_TOTAL_PRICE: '10', ITEM_CGST: '1', ITEM_SGST: '1', ITEM_IGST: '0', ITEM_TAX: '2', ITEM_TOTAL: '12' },
        { ITEM_NO: '2', ITEM_DESCRIPTION: 'Description 2', ITEM_HSN: '654321', ITEM_QTY: '2', ITEM_UNIT_PRICE: '5', ITEM_TOTAL_PRICE: '10', ITEM_CGST: '0.5', ITEM_SGST: '0.5', ITEM_IGST: '0', ITEM_TAX: '1', ITEM_TOTAL: '11' },
    ],
    placeholders: {
        INVOICE_DATE: '2024-05-24',
        CUSTOMER_NAME: 'John Doe',
        CUSTOMER_ADDRESS: '123 Main St, Anytown, USA',
        CUSTOMER_PHONE: '+91 999999999',
        CUSTOMER_EMAIL: 'john.doe@example.com',
        AMT_BEFORE_TAX: '123',
        SUBTOTAL: '1245',
        PAYMENT_METHOD: '5245',
        TOTAL_CGST: '231',
        TOTAL_SGST: '142',
        TOTAL_IGST: '123123',
        TOTAL_TAX: '1442',
        GRAND_TOTAL: '2342'
    }
};

function buildObjectFromRequest(request) {
    const result = {};
    result['INVOICE_NUMBER'] = request.invoiceNumber;
    const itemObject = buildObjectFromArray(request.items);
    Object.assign(result, itemObject);
    Object.assign(result, request.placeholders);
    return result;
}

function generateInvoiceService(req, res) {
    const invoiceNumber = req.params.invoiceNumber;
    const invoiceData = buildObjectFromRequest(req.body);
    generateInvoicePipeline(invoiceNumber, invoiceData);
}


import express from 'express'
import bodyParser from 'body-parser'
import { promisify } from 'util'
// import fs from 'fs'
// const { generateInvoiceService } = require('./yourServiceFile'); // Assuming your service file is named yourServiceFile.js

const app = express();
const port = 9200;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Enable CORS for all domains
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Endpoint to generate invoice
app.post('/generateInvoice/:invoiceNumber', async (req, res) => {
  try {
    const invoiceNumber = req.params.invoiceNumber;
    await generateInvoiceService(req, res);
    const invoiceUrl = `https://invoice.blitzdnd.com/invoices/${makeStringFileNameSafe(invoiceNumber)}.pdf`;
    res.status(200).json({ url: invoiceUrl });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to serve invoice PDFs
app.get('/invoices/:invoiceNumber.pdf', (req, res) => {
  const invoiceNumber = req.params.invoiceNumber;
  const filePath = `./invoices/${makeStringFileNameSafe(invoiceNumber)}.pdf`;
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', err);
      res.status(404).send('File not found');
      return;
    }
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port} & https://invoice.blitzdnd.com/`);
});


export {}