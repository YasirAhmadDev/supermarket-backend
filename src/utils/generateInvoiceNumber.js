import Counter from '../models/Counter.js';

const generateInvoiceNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: 'invoice' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(counter.value).padStart(5, '0');
  return `INV-${padded}`;
};

export default generateInvoiceNumber;