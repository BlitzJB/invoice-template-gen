dummyDataRequest = {
    'invoiceNumber': '123456',
    'items': [
        { 'ITEM_NO': '1', 'ITEM_DESCRIPTION': 'Description 1', 'ITEM_HSN': '123456', 'ITEM_QTY': '1', 'ITEM_UNIT_PRICE': '10', 'ITEM_TOTAL_PRICE': '10', 'ITEM_CGST': '1', 'ITEM_SGST': '1', 'ITEM_IGST': '0', 'ITEM_TAX': '2', 'ITEM_TOTAL': '12' },
        { 'ITEM_NO': '2', 'ITEM_DESCRIPTION': 'Description 2', 'ITEM_HSN': '654321', 'ITEM_QTY': '2', 'ITEM_UNIT_PRICE': '5', 'ITEM_TOTAL_PRICE': '10', 'ITEM_CGST': '0.5', 'ITEM_SGST': '0.5', 'ITEM_IGST': '0', 'ITEM_TAX': '1', 'ITEM_TOTAL': '11' },
    ],
    'placeholders': {
        'INVOICE_DATE': '2024-05-24',
        'CUSTOMER_NAME': 'John Doe',
        'CUSTOMER_ADDRESS': '123 Main St, Anytown, USA',
        'CUSTOMER_PHONE': '+91 999999999',
        'CUSTOMER_EMAIL': 'john.doe@example.com',
        'AMT_BEFORE_TAX': '123',
        'SUBTOTAL': '1245',
        'PAYMENT_METHOD': 'Card',
        'TOTAL_CGST': '231',
        'TOTAL_SGST': '142',
        'TOTAL_IGST': '123123',
        'TOTAL_TAX': '1442',
        'GRAND_TOTAL': '2342',
        "AMT_IN_WORDS": "Two Thousand Three Hundred Forty Two Rupees Only",
    }
}

import requests

res = requests.post("http://localhost:9200/generateInvoice/123456", json=dummyDataRequest)
print(res.text)