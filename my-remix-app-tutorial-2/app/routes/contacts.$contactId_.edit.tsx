import type { LoaderFunctionArgs, ActionFunctionArgs, } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate, useActionData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { z } from "zod";

import { getContact, updateContact } from "~/data.server";

export const loader = async ({
                               params,
                             }: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact });
};

export const action = async ({
                               params,
                               request,
                             }: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  const formSchema = z.object({
    first: z.string().min(3),
    last: z.string().min(3),
    avatar: z.string().url().min(3),
    twitter: z.string().min(3).or(z.literal('')),
    notes: z.string().optional(),
  })

  const validatedFields = formSchema.safeParse(updates);

  if (!validatedFields.success) {
    return json({
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fill out all missing fields.',
      data: null
    })
  }

  await updateContact(params.contactId, updates);
  return redirect(`/contacts/${params.contactId}`);
};


export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const formData = useActionData<typeof action>();
  const errors = formData?.errors;

  console.log(formData, 'data from action');

  return (
    <>
      <div>
        <ul>
          {errors && errors['first']
            ? errors['first'].map((error: string) => (
              <li key={error} className="input-error">
                {error}
              </li>
            ))
            : null}
        </ul>
      </div>
      <Form key={contact.id} id="contact-form" method="post">
        <p>
          <span>Name</span>
          <input
            defaultValue={contact.first}
            aria-label="First name"
            name="first"
            type="text"
            placeholder="First"
          />
          <input
            aria-label="Last name"
            defaultValue={contact.last}
            name="last"
            placeholder="Last"
            type="text"
          />
        </p>
        <label>
          <span>Twitter</span>
          <input
            defaultValue={contact.twitter}
            name="twitter"
            placeholder="@jack"
            type="text"
          />
        </label>
        <label>
          <span>Avatar URL</span>
          <input
            aria-label="Avatar URL"
            defaultValue={contact.avatar}
            name="avatar"
            placeholder="https://example.com/avatar.jpg"
            type="text"
          />
        </label>
        <label>
          <span>Notes</span>
          <textarea
            defaultValue={contact.notes}
            name="notes"
            rows={6}
          />
        </label>
        <p>
          <button type="submit">Save</button>
          <button onClick={() => navigate(-1)} type="button">Cancel</button>
        </p>
      </Form>
    </>
  );
}
