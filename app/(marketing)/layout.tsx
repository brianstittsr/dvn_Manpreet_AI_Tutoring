import { CurioQuestNavbar } from "@/components/shared/curioquest-navbar";
import { CurioQuestFooter } from "@/components/shared/curioquest-footer";
import { ContactPopup } from "@/components/marketing/contact-popup";
import { EventCartProvider } from "@/contexts/event-cart-context";
import { CourseCartProvider } from "@/contexts/course-cart-context";
import { UserProfileProvider } from "@/contexts/user-profile-context";
import { CartProvider } from "@/lib/cart-context";
import { CourseCartDrawer } from "@/components/academy/course-cart-drawer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProfileProvider>
      <CartProvider>
        <EventCartProvider>
          <CourseCartProvider>
            <div className="flex min-h-screen flex-col">
              <CurioQuestNavbar />
              {/* Main content landmark with skip link target - WCAG 2.4.1 */}
              <main id="main-content" className="flex-1" role="main" tabIndex={-1}>
                {children}
              </main>
              <CurioQuestFooter />
              <ContactPopup />
              <CourseCartDrawer />
            </div>
          </CourseCartProvider>
        </EventCartProvider>
      </CartProvider>
    </UserProfileProvider>
  );
}
