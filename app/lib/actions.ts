'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { hash } from 'bcrypt';
import { supabase } from './supabaseClient';
import { FormState } from './definitions';

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

/* export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    image_url?: string[];
    // Add any other fields that can have errors
  };
  message?: string | null;
}; */

// --- CUSTOMER SCHEMA ---
/* const CustomerSchema = z.object({
  id: z.string(),
  name: z.string({
    invalid_type_error: 'Please enter a name.',
  }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  image_url: z.string().url({ message: 'Please enter a valid URL.' }).optional(),
});

const CreateCustomerSchema = CustomerSchema.omit({ id: true });
const UpdateCustomerSchema = CustomerSchema.omit({ id: true }); */

// --- CREATE CUSTOMER ---
// 2. Use the 'State' type for the 'prevState' and the function's return type.
/* export async function createCustomer(prevState: State, formData: FormData): Promise<State> {
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
} */

// --- UPDATE CUSTOMER ---
// 3. Apply the same 'State' type to the update function.
/* export async function updateCustomer(id: string, prevState: State, formData: FormData): Promise<State> {
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
} */

// --- DELETE CUSTOMER ---
/* export async function deleteCustomer(id: string) {
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
} */

// --- New CUSTOMERS ---

// Define the shape of the state object for useFormState
export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    imageFile?: string[];
  };
  message?: string | null;
};

// Zod schemas (no changes)
const CreateCustomerSchema = z.object({
  name: z.string().min(1, { message: 'Please enter a name.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  imageFile: z
    .instanceof(File, { message: 'Image is required.' })
    .refine((file) => file.size > 0, 'Image is required.')
    .refine((file) => file.size <= 5 * 1024 * 1024, `Max image size is 5MB.`),
});

const UpdateCustomerSchema = z.object({
  name: z.string().min(1, { message: 'Please enter a name.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  imageFile: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size === 0 || file.size <= 5 * 1024 * 1024, `Max image size is 5MB.`),
});

// Helper to get the filename from a URL
const getPathFromUrl = (url: string | null): string | null => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        return pathParts[pathParts.length - 1]; // Return only the last part (the filename)
    } catch {
        return null;
    }
}

// --- CREATE CUSTOMER ---
export async function createCustomer(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = CreateCustomerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    imageFile: formData.get('imageFile'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Missing fields.' };
  }

  const { name, email, imageFile } = validatedFields.data;
  let publicUrl = '';

  try {
    const fileExt = imageFile.name.split('.').pop();
    // --- THIS IS THE FIX: The path should be ONLY the filename. ---
    const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('customer-images')
      .upload(fileName, imageFile); // Upload with just the filename

    if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

    const { data } = supabase.storage
      .from('customer-images')
      .getPublicUrl(fileName); // Get URL with just the filename
    
    if (!data.publicUrl) throw new Error("Could not get public URL for the image.");
    publicUrl = data.publicUrl;

    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${publicUrl})
    `;
  } catch (error: any) {
    return { errors: {}, message: error.message };
  }
  
  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

// --- UPDATE CUSTOMER ---
// This action handles replacing the image file.
export async function updateCustomer(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = UpdateCustomerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    imageFile: formData.get('imageFile'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Missing fields.' };
  }
  
  const { name, email, imageFile } = validatedFields.data;
  // This hidden input from the form is crucial.
  const existingImageUrl = formData.get('existingImageUrl') as string || '';
  let finalImageUrl = existingImageUrl;

  try {
    // Only perform storage operations if a new file is actually uploaded.
    if (imageFile && imageFile.size > 0) {
      console.log('New image file detected. Starting replacement process...');
      const fileExt = imageFile.name.split('.').pop();
      const newFileName = `${Date.now()}_${Math.random()}.${fileExt}`;

      // 1. Upload the new file.
      const { error: uploadError } = await supabase.storage
        .from('customer-images')
        .upload(newFileName, imageFile);
      if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);
      console.log('New image uploaded:', newFileName);

      // 2. Get the new public URL.
      const { data: urlData } = supabase.storage.from('customer-images').getPublicUrl(newFileName);
      if (!urlData.publicUrl) throw new Error("Could not get new public URL.");
      finalImageUrl = urlData.publicUrl;

      // 3. Delete the old image file from storage.
      const oldFileName = getPathFromUrl(existingImageUrl);
      if (oldFileName) {
        console.log('Attempting to delete old image:', oldFileName);
        const { error: deleteError } = await supabase.storage
          .from('customer-images')
          .remove([oldFileName]);
        if (deleteError) {
          // Log the error but don't block the update process
          console.error("Failed to delete old image, but proceeding:", deleteError.message);
        } else {
          console.log('Successfully deleted old image.');
        }
      }
    }

    // 4. Update the database record.
    await sql`
      UPDATE customers
      SET name = ${name}, email = ${email}, image_url = ${finalImageUrl}
      WHERE id = ${id}
    `;
  } catch (error: any) {
    return { errors: {}, message: `Operation Failed: ${error.message}` };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

// --- DELETE CUSTOMER ---
export async function deleteCustomer(id: string) {
  try {
    const result = await sql`SELECT image_url FROM customers WHERE id = ${id}`;
    const customer = result[0];
    await sql`DELETE FROM customers WHERE id = ${id}`;

    if (customer?.image_url) {
        const pathToDelete = getPathFromUrl(customer.image_url);
        if (pathToDelete) {
            await supabase.storage.from('customer-images').remove([pathToDelete]);
        }
    }
    revalidatePath('/dashboard/customers');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to Delete Customer.');
  }
}