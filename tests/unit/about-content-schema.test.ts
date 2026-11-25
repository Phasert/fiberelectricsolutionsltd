import { describe, expect, it } from "vitest";
import { aboutContentSchema } from "@/lib/site-content/schemas";

const legacyAboutContent = {
  heroHeading: "About FES",
  heroDescription: "Company introduction.",
  overviewHeading: "Our story",
  overviewBody: "Verified company background.",
  capabilitiesHeading: "Our expertise",
  capabilitiesDescription: "Electrical and fiber-optic capability.",
  imageId: "",
};

describe("About content schema", () => {
  it("upgrades legacy CMS content with the redesigned section defaults", () => {
    const content = aboutContentSchema.parse(legacyAboutContent);

    expect(content.establishedYear).toBe(2004);
    expect(content.labels.introEyebrow).toBe("About FES · Trinidad & Tobago");
    expect(content.approachItems).toHaveLength(3);
    expect(content.electricalExpertiseTitle).toBe("Electrical infrastructure");
    expect(content.fiberExpertiseTitle).toBe("Fiber-optic connectivity");
  });

  it("strips legacy CTA settings from editable content", () => {
    const content = aboutContentSchema.parse({
      ...legacyAboutContent,
      ctaHref: "/contact",
      ctaLabel: "Contact us",
    });
    expect(content).not.toHaveProperty("ctaHref");
    expect(content).not.toHaveProperty("ctaLabel");
  });
});
