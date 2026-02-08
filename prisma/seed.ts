import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Victorian mental health resources...");

  const resources = [
    // CRISIS SERVICES
    {
      name: "Lifeline",
      type: "hotline",
      description:
        "24/7 crisis support and suicide prevention services. Trained counselors available to listen and provide support.",
      phone: "13 11 14",
      website: "https://www.lifeline.org.au",
      region: "National",
      tags: ["crisis", "suicide", "24/7", "phone"],
      priority: 100,
    },
    {
      name: "Lifeline Text",
      type: "hotline",
      description:
        "24/7 crisis support via SMS for those who prefer texting.",
      phone: "0477 13 11 14",
      website: "https://www.lifeline.org.au/crisis-text",
      region: "National",
      tags: ["crisis", "suicide", "24/7", "text"],
      priority: 95,
    },
    {
      name: "Beyond Blue",
      type: "hotline",
      description:
        "24/7 support for anxiety, depression and suicide prevention. Information, support and referrals.",
      phone: "1300 22 4636",
      website: "https://www.beyondblue.org.au",
      region: "National",
      tags: ["anxiety", "depression", "24/7", "phone"],
      priority: 90,
    },
    {
      name: "SANE Australia",
      type: "hotline",
      description:
        "Support for people living with complex mental health issues. Helpline operates 10am-10pm AEST weekdays.",
      phone: "1800 187 263",
      website: "https://www.sane.org",
      region: "National",
      tags: ["mental-illness", "support", "phone"],
      priority: 85,
    },
    {
      name: "Victorian Mental Health Crisis Line",
      type: "hotline",
      description:
        "24/7 telephone triage and referral service for Victorian residents experiencing a mental health crisis.",
      phone: "1300 842 747",
      website: "https://www.health.vic.gov.au",
      region: "Victoria",
      tags: ["crisis", "24/7", "victoria", "phone"],
      priority: 95,
    },

    // SPECIALIZED SUPPORT
    {
      name: "QLife",
      type: "hotline",
      description:
        "Anonymous and free LGBTIQ+ peer support and referral service. Available 3pm-midnight daily.",
      phone: "1800 184 527",
      website: "https://qlife.org.au",
      region: "National",
      tags: ["lgbtiq", "peer-support", "phone"],
      priority: 80,
    },
    {
      name: "MensLine Australia",
      type: "hotline",
      description:
        "24/7 telephone and online counseling for men with family and relationship concerns.",
      phone: "1300 78 99 78",
      website: "https://mensline.org.au",
      region: "National",
      tags: ["men", "relationships", "24/7", "phone"],
      priority: 75,
    },
    {
      name: "1800RESPECT",
      type: "hotline",
      description:
        "24/7 counseling service for people impacted by sexual assault, domestic or family violence.",
      phone: "1800 737 732",
      website: "https://www.1800respect.org.au",
      region: "National",
      tags: ["domestic-violence", "sexual-assault", "24/7", "phone"],
      priority: 90,
    },
    {
      name: "Kids Helpline",
      type: "hotline",
      description:
        "24/7 counseling service for young people aged 5-25. Phone, webchat and email support.",
      phone: "1800 55 1800",
      website: "https://kidshelpline.com.au",
      region: "National",
      tags: ["youth", "young-adults", "24/7", "phone", "webchat"],
      priority: 85,
    },

    // VICTORIAN SERVICES
    {
      name: "Headspace Melbourne",
      type: "service",
      description:
        "Youth mental health service for 12-25 year olds. Free or low-cost support for mental health, physical health, alcohol and drug services.",
      phone: "(03) 9027 0100",
      website: "https://headspace.org.au",
      address: "Multiple locations across Melbourne",
      region: "Victoria",
      tags: ["youth", "young-adults", "free", "counseling"],
      priority: 80,
    },
    {
      name: "Victorian Aboriginal Health Service (VAHS)",
      type: "service",
      description:
        "Culturally safe mental health and wellbeing support for Aboriginal and Torres Strait Islander people.",
      phone: "(03) 9419 3000",
      website: "https://www.vahs.org.au",
      address: "186 Nicholson St, Fitzroy VIC 3065",
      region: "Victoria",
      tags: ["aboriginal", "indigenous", "culturally-safe", "counseling"],
      priority: 85,
    },
    {
      name: "The Royal Melbourne Hospital Mental Health",
      type: "hospital",
      description:
        "Specialist mental health services including emergency psychiatric assessment.",
      phone: "(03) 9342 7000",
      website: "https://www.thermh.org.au",
      address: "300 Grattan St, Parkville VIC 3050",
      region: "Victoria",
      tags: ["hospital", "emergency", "acute-care"],
      priority: 70,
    },
    {
      name: "St Vincent's Mental Health Service",
      type: "hospital",
      description:
        "Mental health emergency and crisis assessment, acute inpatient care, and community services.",
      phone: "(03) 9288 2211",
      website: "https://www.svhm.org.au",
      address: "41 Victoria Parade, Fitzroy VIC 3065",
      region: "Victoria",
      tags: ["hospital", "emergency", "acute-care"],
      priority: 70,
    },

    // ONLINE SERVICES
    {
      name: "Beyond Blue Forums",
      type: "service",
      description:
        "Moderated online community for people experiencing anxiety, depression and suicide-related issues.",
      website:
        "https://www.beyondblue.org.au/get-support/online-forums",
      region: "National",
      tags: ["online", "peer-support", "forum", "anxiety", "depression"],
      priority: 60,
    },
    {
      name: "ReachOut",
      type: "service",
      description:
        "Online mental health support for young people aged 14-25. Articles, tools, peer forums.",
      website: "https://au.reachout.com",
      region: "National",
      tags: ["online", "youth", "young-adults", "self-help"],
      priority: 65,
    },
    {
      name: "MindSpot",
      type: "service",
      description:
        "Free online and telephone mental health clinic. Assessment and treatment courses for anxiety and depression.",
      phone: "1800 61 44 34",
      website: "https://www.mindspot.org.au",
      region: "National",
      tags: ["online", "free", "anxiety", "depression", "courses"],
      priority: 70,
    },
    {
      name: "This Way Up",
      type: "service",
      description:
        "Evidence-based online mental health programs. Some free courses, GP referral for subsidized access.",
      website: "https://thiswayup.org.au",
      region: "National",
      tags: ["online", "courses", "anxiety", "depression", "self-help"],
      priority: 65,
    },

    // GENERAL PRACTITIONERS
    {
      name: "Medicare Mental Health Care Plans",
      type: "service",
      description:
        "See your GP for a Mental Health Care Plan to access up to 10 subsidized psychology sessions per year under Medicare.",
      phone: "1800 022 222 (Medicare)",
      website:
        "https://www.health.gov.au/health-topics/mental-health-and-suicide-prevention",
      region: "National",
      tags: ["gp", "medicare", "subsidized", "psychology"],
      priority: 90,
    },
  ];

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { name: resource.name },
      update: resource,
      create: resource,
    });
  }

  console.log(`Seeded ${resources.length} resources`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
