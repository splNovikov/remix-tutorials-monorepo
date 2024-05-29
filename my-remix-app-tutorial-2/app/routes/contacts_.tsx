export default function Contacts() {
  return (
    <div id="contacts">
      This is just for the case if someone routes to /contacts.
      I think (pavel) we do not need this route since we have an _index route, which shows dummy page when no contact selected
      This thing we can do is a redirect to "/" route if someone accidentally access this route
    </div>
  );
}
