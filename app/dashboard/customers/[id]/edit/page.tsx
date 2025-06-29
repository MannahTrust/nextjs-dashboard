import Form from '@/app/ui/customers/edit-form';
import Breadcrumbs from '@/app/ui/customers/breadcrumbs';
import { fetchCustomerById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
// Ensure the props signature is correct.
export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
 
  // Ensure you are not using square brackets here.
  const customer = await fetchCustomerById(id);
 
  if (!customer) {
    notFound();
  }
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          {
            label: 'Edit Customer',
            href: `/dashboard/customers/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form customer={customer} />
    </main>
  );
}