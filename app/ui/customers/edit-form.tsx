// ui/customers/edit-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { updateCustomer } from '@/app/lib/actions';
import { Customer, FormState } from '@/app/lib/definitions';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function EditCustomerForm({ customer }: { customer: Customer; }) {
  const initialState: FormState = { message: null, errors: {} };
  const updateCustomerWithId = updateCustomer.bind(null, customer.id);
  const [state, dispatch] = useActionState(updateCustomerWithId, initialState);
  const [previewUrl, setPreviewUrl] = useState(customer.image_url);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        
        {/* --- THIS IS THE FIX --- */}
        {/* Name and Email fields restored */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={customer.name}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={customer.email}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        {/* Customer Image */}
        <div className="mb-4">
          <label htmlFor="imageFile" className="mb-2 block text-sm font-medium">
            Update Profile Picture (Optional)
          </label>
          <div className="flex items-center gap-4">
            <Image 
                src={previewUrl}
                alt="Profile picture preview"
                width={60}
                height={60}
                className="rounded-full object-cover"
            />
            <input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <input type="hidden" name="existingImageUrl" value={customer.image_url} />
        </div>
        
        <div aria-live="polite" aria-atomic="true">
          {state?.message ? (
            <p className="my-2 text-sm text-red-500">{state.message}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link href="/dashboard/customers" className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium">
          Cancel
        </Link>
        <Button type="submit">Update Customer</Button>
      </div>
    </form>
  );
}