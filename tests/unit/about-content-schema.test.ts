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

    expect(content.establishedYear).toBe(2008);
    expect(content.labels.introEyebrow).toBe("About FES · Trinidad & Tobago");
    expect(content.approachItems).toHaveLength(3);
    expect(content.electricalExpertiseTitle).toBe("Electrical infrastructure");
    expect(content.fiberExpertiseTitle).toBe("Fibre-optic connectivity");
    expect(content.capabilitiesDescription).toBe("Electrical and fibre-optic capability.");
  });

  it("corrects the previous founding year and preserves the company name", () => {
    const content = aboutContentSchema.parse({
      ...legacyAboutContent,
      establishedYear: 2004,
      overviewHeading: "Quality service since 2004",
      overviewBody: "Established in 2004, Fiber & Electric Solutions Ltd. installs fiber-optic cables.",
    });

    expect(content.establishedYear).toBe(2008);
    expect(content.overviewHeading).toBe("Quality service since 2008");
    expect(content.overviewBody).toBe("Established in 2008, Fiber & Electric Solutions Ltd. installs fibre-optic cables.");
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
