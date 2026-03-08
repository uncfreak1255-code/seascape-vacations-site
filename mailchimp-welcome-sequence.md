# Mailchimp Welcome Sequence — Seascape Vacations

## Overview
- **Trigger:** New subscriber joins via email popup (SAVE50 coupon)
- **Mailchimp account:** us6, list ID 95e5a594d1
- **3-email sequence** with delays between each

---

## Email 1: Welcome + Coupon Delivery
**Send:** Immediately after signup
**Subject line:** Your $50 off code is inside 🏖️
**Preview text:** Plus 3 things most visitors miss about Bradenton Beach

**Body:**

Hey FNAME,

You just locked in $50 off your Gulf Coast trip. Here's your code:

**SAVE50**

Use it when you book direct at seascape-vacations.com. It works on any of our 5 waterfront homes — just need a 3-night minimum stay.

Quick rundown of what we've got:

🏡 **The Oasis** — Heated pool, 2 min to the Manatee River. Sleeps 8.
⛵ **Dockside Dreams** — Private dock, bring your boat. Sleeps 10.
🌊 **River House** — Right on the water with kayaks included. Sleeps 6.
🏊 **Bradenton Pool Home** — Big backyard pool, great for families. Sleeps 8.
✨ **Sarasota Luxe** — Upscale Sarasota pad, close to Siesta Key. Sleeps 6.

**3 things most visitors don't know about this area:**

1. Anna Maria Island is 15 min from our Bradenton homes — same beaches, way less crowded than Clearwater
2. The fishing off our docks is legit. Snook, redfish, tarpon during season. No boat needed.
3. Book direct with us and you save 10-15% vs. Airbnb/VRBO (their service fees are brutal)

Browse all properties: https://seascape-vacations.com/properties/

Talk soon,
Sawyer
Seascape Vacations

P.S. — That SAVE50 code doesn't expire, but our peak season (March-April) books up fast. Just saying.

---

**CTA Button:** Browse Our 5 Homes → https://seascape-vacations.com/properties/

---

## Email 2: Social Proof + Area Guide
**Send:** 3 days after Email 1
**Subject line:** What 200+ guests keep saying about our places
**Preview text:** Real reviews + our favorite local spots (from people who actually live here)

**Body:**

Hey FNAME,

Quick question — have you picked your dates yet?

If you're still deciding where to stay on the Gulf Coast, here's what actual guests say about us:

⭐⭐⭐⭐⭐ *"We've been coming to AMI for 10 years and this was our best stay. The dock at Dockside Dreams is perfect — we caught snook right off the back."* — Mike R.

⭐⭐⭐⭐⭐ *"The Oasis pool was a hit with our kids. And being 10 minutes from Anna Maria Island meant we could do beach days without the bridge traffic headache."* — Sarah T.

⭐⭐⭐⭐⭐ *"Saved over $400 booking direct vs. what Airbnb wanted for the same dates. No-brainer."* — James L.

**Our local picks (stuff the tourist blogs won't tell you):**

🍽️ **Best grouper sandwich:** Anna Maria Oyster Bar — get the blackened grouper, not the fried
🏖️ **Best quiet beach:** Coquina Beach, south end of AMI. Parking lot is bigger, crowds are smaller
🎣 **Best fishing spot:** The Rod & Reel Pier — show up at sunrise, bring shrimp
🍺 **Best sunset drinks:** The Sandbar on Anna Maria — sit outside, order the mahi tacos

We put together area guides for every part of the Gulf Coast:
→ https://seascape-vacations.com/guides/bradenton-vs-sarasota/
→ https://seascape-vacations.com/guides/anna-maria-island-vs-siesta-key/
→ https://seascape-vacations.com/guides/best-time-visit-anna-maria-island.html

Still have your $50 off code? It's **SAVE50** — works on any property.

— Sawyer

---

**CTA Button:** Check Availability → https://seascape-vacations.com/properties/

---

## Email 3: Urgency + Direct Booking Push
**Send:** 7 days after Email 1 (4 days after Email 2)
**Subject line:** Dates are filling up for spring — wanted to give you a heads up
**Preview text:** Your $50 code + why direct booking saves you way more than you think

**Body:**

Hey FNAME,

Not trying to create fake urgency — but our spring calendar is actually getting thin. March and April on the Gulf Coast are prime time, and our 5 homes don't last long.

Here's what's still available as of right now:

→ **Check live availability:** https://seascape-vacations.com/properties/

**Why book direct instead of Airbnb/VRBO:**

| | Book Direct | Airbnb/VRBO |
|--|------------|-------------|
| Service fees | $0 | $150-400+ |
| Your $50 code | ✅ Works | ❌ Nope |
| Direct line to us | ✅ Text/call anytime | ❌ Through the app |
| Flexible changes | ✅ Just call us | ❌ Subject to policies |
| Total savings | **10-15% less** | Full price + fees |

The math is real. On a 5-night stay at Dockside Dreams, you'd save roughly $350-500 vs. the OTA listing price.

Your code: **SAVE50** (3-night min, any property)

Book here: https://seascape-vacations.com/properties/

If you have questions about which property fits your group best, just reply to this email. I personally answer every one.

— Sawyer
Founder, Seascape Vacations
📱 (941) XXX-XXXX

---

**CTA Button:** Book Direct & Save → https://seascape-vacations.com/properties/

---

## Mailchimp Setup Instructions

### Automation Setup
1. Go to Mailchimp → Automations → Create → Customer Journey
2. Starting point: "Subscribes to audience" (list 95e5a594d1)
3. Add 3 email steps with delays:
   - Step 1: Send immediately
   - Step 2: Wait 3 days, then send
   - Step 3: Wait 4 more days (7 days total), then send

### Settings
- From name: Sawyer @ Seascape Vacations
- Reply-to: (use actual business email)
- Track opens and clicks: Yes
- Google Analytics tracking: Yes (utm_source=mailchimp, utm_medium=email, utm_campaign=welcome_sequence)

### Personalization
- Use `*|FNAME|*` merge tag (already captured in popup)
- Fallback: "there" (so "Hey there," if no first name)

### Testing
- Send test emails to yourself before activating
- Check all links work
- Verify SAVE50 code is live in Hostaway
- Preview on mobile (most email opens are mobile)

### Success Metrics (check after 30 days)
- Email 1: Target 60%+ open rate, 15%+ click rate
- Email 2: Target 40%+ open rate, 10%+ click rate
- Email 3: Target 35%+ open rate, 8%+ click rate
- Sequence conversion: Target 2-3% of subscribers book within 30 days
