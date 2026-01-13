/**
 * Footer Component
 * Application footer
 */

export default function Footer() {
  return (
    <footer className="border-t bg-card py-4">
      <div className="container px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Zimasa PeopleWell. All rights reserved.</p>
      </div>
    </footer>
  );
}
