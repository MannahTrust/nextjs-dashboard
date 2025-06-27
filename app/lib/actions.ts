'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { hash } from 'bcrypt';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // We'll log the error to the console for now
    console.error(error);
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
  }

  
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    // We'll log the error to the console for now
    console.error(error);
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {


  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function registerUser(
  prevState: string | undefined,
  formData: FormData,
) {
  // 1. Define a schema for input validation using Zod
  const RegisterSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  });

  // 2. Parse and validate form data
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.errors.map(e => e.message).join(' ');
    return errorMessages;
  }

  const { name, email, password } = validatedFields.data;

  try {
    // 3. Hash the password before storing it
    const hashedPassword = await hash(password, 10);

    // 4. Check if user already exists using a raw SQL query
    const existingUsers = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return 'An account with this email already exists.';
    }

    // 5. Insert the new user into the database
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;

  } catch (error) {
    // 6. Handle database or other unexpected errors
    console.error(error);
    return 'Something went wrong. Please try again.';
  }

  // 7. Redirect to the login page upon successful registration
  redirect('/login');
}

export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    image_url?: string[];
    // Add any other fields that can have errors
  };
  message?: string | null;
};

const CustomerSchema = z.object({
  id: z.string(),
  name: z.string({
    invalid_type_error: 'Please enter a name.',
  }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  image_url: z.string().url({ message: 'Please enter a valid URL.'}).optional(),
});

const CreateCustomerSchema = CustomerSchema.omit({ id: true });
const UpdateCustomerSchema = CustomerSchema.omit({ id: true });

// --- CREATE CUSTOMER ---
// 2. Use the 'State' type for the 'prevState' and the function's return type.
export async function createCustomer(prevState: State, formData: FormData): Promise<State> {
  // Validate form fields
  const validatedFields = CreateCustomerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_url: formData.get('image_url'),
  });

  // If form validation fails, return errors.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
    };
  }

  // Prepare data for insertion
  const { name, email, image_url } = validatedFields.data;

  try {
    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${image_url || ''})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Customer.',
    };
  }

  // Revalidate and redirect
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

// --- UPDATE CUSTOMER ---
// 3. Apply the same 'State' type to the update function.
export async function updateCustomer(id: string, prevState: State, formData: FormData): Promise<State> {
  const validatedFields = UpdateCustomerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_url: formData.get('image_url'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Customer.',
    };
  }

  const { name, email, image_url } = validatedFields.data;

  try {
    await sql`
      UPDATE customers
      SET name = ${name}, email = ${email}, image_url = ${image_url || ''}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Customer.' };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

// --- DELETE CUSTOMER ---
export async function deleteCustomer(id: string) {
  // It's good practice to add a try...catch block here too.
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
    // Revalidating the path is the key side-effect we need.
    revalidatePath('/dashboard/customers');
  } catch (error) {
    // If you want to handle the error, you could log it
    // or re-throw it, but for the form's sake, we don't return it.
    console.error('Database Error: Failed to Delete Customer.', error);
    // You could throw a new error to indicate failure to the server logs
    throw new Error('Failed to Delete Customer.');
  }
}