export type Discipline =
  | 'Hiking & Camping'
  | 'Climbing & Snow'
  | 'Water, Surf & Dive'
  | 'Cycling & Running'
  | 'Birding & Conservation'
  | 'Land & Heritage';

export type OrgType =
  | 'Outdoor Club'
  | 'Nonprofit & Advocacy'
  | 'Coalition & Media'
  | 'Land & Stewardship';

export type Region =
  | 'National'
  | 'West'
  | 'Southwest'
  | 'Midwest'
  | 'South'
  | 'Northeast'
  | 'International';

export interface DirectoryOrganization {
  id: string;
  name: string;
  discipline: Discipline;
  orgType: OrgType;
  region: Region;
  location: string;
  founded: string;
  chapterCount: string;
  website: string;
  instagram: string;
  summary: string;
  highlights: string[];
  imageUrl: string;
  source: 'curated' | 'community';
  authorId?: string;
  authorName?: string;
}

export const EDITORIAL_IMAGES = {
  hero: '/src/assets/images/hero_trail_community_1795218078083.jpg',
  climbing: '/src/assets/images/editorial_climbing_alpine_1795218078049.jpg',
  water: '/src/assets/images/editorial_surf_water_1795218078763.jpg',
  camping: '/src/assets/images/editorial_camping_land_1795218077597.jpg',
  cycling: '/src/assets/images/editorial_cycling_birding_1795218077983.jpg',
} as const;

export function getDisciplineImage(discipline: Discipline): string {
  switch (discipline) {
    case 'Climbing & Snow':
      return EDITORIAL_IMAGES.climbing;
    case 'Water, Surf & Dive':
      return EDITORIAL_IMAGES.water;
    case 'Cycling & Running':
      return EDITORIAL_IMAGES.cycling;
    case 'Hiking & Camping':
      return EDITORIAL_IMAGES.camping;
    case 'Birding & Conservation':
    case 'Land & Heritage':
      return EDITORIAL_IMAGES.hero;
  }
}

export const DISCIPLINES: Discipline[] = [
  'Hiking & Camping',
  'Climbing & Snow',
  'Water, Surf & Dive',
  'Cycling & Running',
  'Birding & Conservation',
  'Land & Heritage',
];

export const ORG_TYPES: OrgType[] = [
  'Outdoor Club',
  'Nonprofit & Advocacy',
  'Coalition & Media',
  'Land & Stewardship',
];

export const REGIONS: Region[] = [
  'National',
  'West',
  'Southwest',
  'Midwest',
  'South',
  'Northeast',
  'International',
];

export const CURATED_ORGANIZATIONS: DirectoryOrganization[] = [
  {
    id: 'outdoor-afro',
    name: 'Outdoor Afro',
    discipline: 'Hiking & Camping',
    orgType: 'Nonprofit & Advocacy',
    region: 'National',
    location: 'Oakland, CA · 80+ Chapters',
    founded: '2009',
    chapterCount: '80+ U.S. Chapters',
    website: 'https://outdoorafro.org',
    instagram: '@outdoorafro',
    summary:
      'Founded by Rue Mapp, Outdoor Afro is a national network reconnecting Black communities to land, water, and wildlife through trained volunteer leaders hosting hikes, paddles, campouts, swimming education, and conservation advocacy.',
    highlights: [
      'Annual volunteer leadership training across 30+ states',
      'Making Waves swim education initiative for youth and families',
      'National public lands & conservation policy advocacy',
    ],
    imageUrl: EDITORIAL_IMAGES.hero,
    source: 'curated',
  },
  {
    id: 'national-brotherhood-of-skiers',
    name: 'National Brotherhood of Skiers',
    discipline: 'Climbing & Snow',
    orgType: 'Outdoor Club',
    region: 'National',
    location: 'Chicago, IL · 50+ Ski Clubs',
    founded: '1973',
    chapterCount: '50+ Member Clubs',
    website: 'https://nbs.org',
    instagram: '@nbsofficial',
    summary:
      'The largest Black winter sports organization in the United States, uniting regional ski and snowboard clubs for annual mountain summits, youth athlete scholarships, and Olympic winter sports pipeline development.',
    highlights: [
      'Historic annual Black Summit drawing thousands of skiers',
      'Olympic Scholarship Fund supporting youth alpine racers',
      'Regional chapters from Atlanta to Seattle and Denver',
    ],
    imageUrl: EDITORIAL_IMAGES.climbing,
    source: 'curated',
  },
  {
    id: 'nabs-scuba',
    name: 'National Association of Black Scuba Divers',
    discipline: 'Water, Surf & Dive',
    orgType: 'Outdoor Club',
    region: 'International',
    location: 'Washington, D.C. · Global Clubs',
    founded: '1991',
    chapterCount: '50+ Affiliated Dive Clubs',
    website: 'https://nabsdivers.org',
    instagram: '@nabsdivers',
    summary:
      'Co-founded by Dr. Jose Jones and Ric Powell, NABS connects Black scuba clubs worldwide to promote underwater safety, marine conservation, youth aquatics certification, and annual international dive summits.',
    highlights: [
      'Annual Dive Summit gathering certified divers and trainees',
      'Youth scuba certification & marine biology mentorship',
      'Partner foundation for maritime archaeology programs',
    ],
    imageUrl: EDITORIAL_IMAGES.water,
    source: 'curated',
  },
  {
    id: 'black-girls-trekkin',
    name: "Black Girls Trekkin'",
    discipline: 'Hiking & Camping',
    orgType: 'Outdoor Club',
    region: 'West',
    location: 'Los Angeles, CA',
    founded: '2017',
    chapterCount: 'Southern California',
    website: 'https://blackgirlstrekkin.com',
    instagram: '@blackgirlstrekkin',
    summary:
      'A Los Angeles-based community and advocacy group encouraging Black women and girls to explore trails, national parks, and wilderness stewardship through beginner-friendly group hikes, backpacking clinics, and campouts.',
    highlights: [
      'Monthly SoCal trail meetups from Griffith Park to Yosemite',
      'Leave No Trace & wilderness safety workshops',
      'National park group retreats and gear introductions',
    ],
    imageUrl: EDITORIAL_IMAGES.hero,
    source: 'curated',
  },
  {
    id: 'brothers-of-climbing',
    name: 'Brothers of Climbing',
    discipline: 'Climbing & Snow',
    orgType: 'Outdoor Club',
    region: 'Northeast',
    location: 'Brooklyn, NY · National',
    founded: '2010',
    chapterCount: 'NYC & National Meetups',
    website: 'https://boccrew.com',
    instagram: '@boccrew',
    summary:
      'A climbing crew and community organization expanding representation of people of color in indoor bouldering, outdoor rock climbing, and alpine mountaineering through gym nights, outdoor crag days, and festival partnerships.',
    highlights: [
      'Co-host of Color the Crag climbing festival',
      'Regular NYC gym meetups and Gunks outdoor trips',
      'Mentorship into lead climbing and trad skills',
    ],
    imageUrl: EDITORIAL_IMAGES.climbing,
    source: 'curated',
  },
  {
    id: 'brown-girls-climb',
    name: 'Brown Girls Climb',
    discipline: 'Climbing & Snow',
    orgType: 'Nonprofit & Advocacy',
    region: 'National',
    location: 'National · Regional Chapters',
    founded: '2016',
    chapterCount: '25+ Local Meetups',
    website: 'https://browngirlsclimb.com',
    instagram: '@browngirlsclimb',
    summary:
      'Elevating women and non-binary climbers of color by increasing visibility, building local climbing meetups, supporting climbing leadership certifications, and partnering with gyms to lower financial barriers.',
    highlights: [
      'Local gym meetup network across major U.S. cities',
      'Discounted memberships and gear library partnerships',
      'AMGA and outdoor leadership training pathways',
    ],
    imageUrl: EDITORIAL_IMAGES.climbing,
    source: 'curated',
  },
  {
    id: 'camp-yoshi',
    name: 'Camp Yoshi',
    discipline: 'Hiking & Camping',
    orgType: 'Outdoor Club',
    region: 'West',
    location: 'Portland, OR · National Expeditions',
    founded: '2020',
    chapterCount: 'Guided Expeditions',
    website: 'https://campyoshi.com',
    instagram: '@camp.yoshi',
    summary:
      'Curated backcountry camping, overlanding, and open-fire culinary expeditions built to welcome Black adventurers and allies into remote Western landscapes with full outfitting, chef-led meals, and restorative camp culture.',
    highlights: [
      'All-inclusive overland camping & gourmet camp cooking',
      'Expeditions across Oregon, Utah, Joshua Tree & beyond',
      'High-craft gear collaborations and community guides',
    ],
    imageUrl: EDITORIAL_IMAGES.camping,
    source: 'curated',
  },
  {
    id: 'soul-trak-outdoors',
    name: 'Soul Trak Outdoors',
    discipline: 'Birding & Conservation',
    orgType: 'Nonprofit & Advocacy',
    region: 'Northeast',
    location: 'Washington, D.C.',
    founded: '2018',
    chapterCount: 'DMV Region',
    website: 'https://soultrak.com',
    instagram: '@soultrakoutdoors',
    summary:
      'A Washington, D.C. nonprofit connecting urban communities of color to green spaces and rivers through rock climbing, whitewater kayaking, backpacking, civic advocacy, and its Collegiate Outdoor Leadership Program.',
    highlights: [
      'HBCU & collegiate outdoor leadership fellowships',
      'Potomac River paddling and Shenandoah trail excursions',
      'Youth outdoor equity & park access advocacy',
    ],
    imageUrl: EDITORIAL_IMAGES.hero,
    source: 'curated',
  },
  {
    id: 'black-girls-do-bike',
    name: 'Black Girls Do Bike',
    discipline: 'Cycling & Running',
    orgType: 'Outdoor Club',
    region: 'National',
    location: 'Pittsburgh, PA · 100+ Chapters',
    founded: '2013',
    chapterCount: '100+ U.S. Chapters',
    website: 'https://blackgirlsdobike.org',
    instagram: '@blackgirlsdobike',
    summary:
      'A nationwide sisterhood of women of color cyclists growing comfort and joy on two wheels through no-drop community rides, bicycle maintenance clinics, Shero chapter captains, and annual multi-day cycling rallies.',
    highlights: [
      'Over 100 active chapters led by local "Shero" captains',
      'Beginner-friendly no-drop road, gravel & greenway rides',
      'Annual BGDB rally and bike safety workshops',
    ],
    imageUrl: EDITORIAL_IMAGES.cycling,
    source: 'curated',
  },
  {
    id: 'major-taylor-cycling',
    name: 'Major Taylor Cycling Clubs',
    discipline: 'Cycling & Running',
    orgType: 'Outdoor Club',
    region: 'National',
    location: 'Los Angeles, Chicago, Twin Cities & More',
    founded: '1979',
    chapterCount: '30+ Independent Chapters',
    website: 'https://majortaylorassociation.org',
    instagram: '@majortaylorcyclingclubla',
    summary:
      'Honoring 1899 world sprint cycling champion Marshall "Major" Taylor, independent chapters nationwide organize group road rides, century training, cycling safety advocacy, and youth bike giveaways.',
    highlights: [
      'Weekly group pelotons across multiple pace tiers',
      'Preserving the athletic legacy of Marshall Major Taylor',
      'Community charity centuries and urban bike safety',
    ],
    imageUrl: EDITORIAL_IMAGES.cycling,
    source: 'curated',
  },
  {
    id: 'laru-beya-collective',
    name: 'Laru Beya Collective',
    discipline: 'Water, Surf & Dive',
    orgType: 'Nonprofit & Advocacy',
    region: 'Northeast',
    location: 'Rockaway Beach, NY',
    founded: '2018',
    chapterCount: 'New York City Coast',
    website: 'https://larubeyacollective.com',
    instagram: '@larubeyacollective',
    summary:
      'A 501(c)(3) nonprofit in Far Rockaway empowering youth and historically excluded communities through free surf instruction, ocean water safety, coastal stewardship, and community beach gatherings.',
    highlights: [
      'Free seasonal surf and water-safety camps for NYC youth',
      'Board & wetsuit access eliminating financial gatekeeping',
      'Beach cleanups and coastal resilience education',
    ],
    imageUrl: EDITORIAL_IMAGES.water,
    source: 'curated',
  },
  {
    id: 'black-surfers-collective',
    name: 'Black Surfers Collective',
    discipline: 'Water, Surf & Dive',
    orgType: 'Outdoor Club',
    region: 'West',
    location: 'Los Angeles, CA (Inkwell Beach)',
    founded: '2012',
    chapterCount: 'Southern California Coast',
    website: 'https://blacksurferscollective.org',
    instagram: '@blacksurferscollective',
    summary:
      'Rooted in the historic legacy of Inkwell Beach in Santa Monica, Black Surfers Collective promotes ocean literacy, surf mentorship, and welcoming coastal community lineups across Southern California.',
    highlights: [
      'Community surf days honoring Nick Gabaldon & Inkwell Beach',
      'Beginner surf clinics and ocean safety fundamentals',
      'Intergenerational beach stewardship events',
    ],
    imageUrl: EDITORIAL_IMAGES.water,
    source: 'curated',
  },
  {
    id: 'blackafinstem-birders',
    name: 'BlackAFinSTEM (Black Birders Week)',
    discipline: 'Birding & Conservation',
    orgType: 'Coalition & Media',
    region: 'National',
    location: 'National · Digital & Regional Walks',
    founded: '2020',
    chapterCount: 'Nationwide Collective',
    website: 'https://blackafinstem.com',
    instagram: '@blackafinstem',
    summary:
      'A collective of Black naturalists, wildlife biologists, and environmental scientists who launched Black Birders Week to celebrate Black joy in birding, elevate Black voices in ecology, and organize guided nature walks.',
    highlights: [
      'Annual Black Birders Week walks and wildlife panels',
      'Visibility & mentorship for Black wildlife scientists',
      'Partnerships with Audubon chapters and national refuges',
    ],
    imageUrl: EDITORIAL_IMAGES.hero,
    source: 'curated',
  },
  {
    id: 'backyard-basecamp',
    name: 'Backyard Basecamp',
    discipline: 'Birding & Conservation',
    orgType: 'Land & Stewardship',
    region: 'Northeast',
    location: 'Baltimore, MD',
    founded: '2019',
    chapterCount: 'Baltimore & BLISS Meadows',
    website: 'https://backyardbasecamp.org',
    instagram: '@backyard_basecamp',
    summary:
      'Reconnecting Black, Indigenous, and People of Color in Baltimore to land and wildlife through neighborhood birding walks, urban farming, pollinator meadows, and stewarding the 10-acre BLISS Meadows sanctuary.',
    highlights: [
      'Stewardship of BLISS Meadows urban land reclamation site',
      'Low-barrier local birding, foraging & garden workshops',
      'Environmental education for Baltimore families & youth',
    ],
    imageUrl: EDITORIAL_IMAGES.camping,
    source: 'curated',
  },
  {
    id: 'black-folks-camp-too',
    name: 'Black Folks Camp Too',
    discipline: 'Hiking & Camping',
    orgType: 'Coalition & Media',
    region: 'South',
    location: 'Brevard, NC · National Network',
    founded: '2019',
    chapterCount: 'National Campground Partners',
    website: 'https://blackfolkscamptoo.com',
    instagram: '@blackfolkscamptoo',
    summary:
      'Founded by Earl B. Hunter Jr., Black Folks Camp Too removes fear and adds knowledge around camping and RV life through the Unity Blaze symbol, state park partnerships, and outdoor hospitality education.',
    highlights: [
      'Unity Blaze symbol marking welcoming campgrounds',
      'Digital Education & Campground Hospitality training',
      'Partnerships with state parks and RV manufacturers',
    ],
    imageUrl: EDITORIAL_IMAGES.camping,
    source: 'curated',
  },
  {
    id: 'black-people-who-hike',
    name: 'Black People Who Hike',
    discipline: 'Hiking & Camping',
    orgType: 'Outdoor Club',
    region: 'Midwest',
    location: 'St. Louis, MO · Midwest & National',
    founded: '2019',
    chapterCount: 'St. Louis & Touring Chapters',
    website: 'https://blackpeoplewhohike.com',
    instagram: '@blackpeoplewhohike',
    summary:
      'Founded by Debbie Njai in St. Louis, Black People Who Hike empowers Black communities on trails and waterways through guided hikes, kayaking, rock climbing, wellness retreats, and its youth outdoors fund.',
    highlights: [
      'Weekly Midwest group hikes and trailhead check-ins',
      'Multi-sport adventure days including kayaking & climbing',
      'National travel retreats and community wellness focus',
    ],
    imageUrl: EDITORIAL_IMAGES.hero,
    source: 'curated',
  },
  {
    id: 'blackpackers',
    name: 'Blackpackers',
    discipline: 'Hiking & Camping',
    orgType: 'Nonprofit & Advocacy',
    region: 'West',
    location: 'Colorado Springs, CO',
    founded: '2019',
    chapterCount: 'Colorado Front Range',
    website: 'https://coblackpackers.com',
    instagram: '@coblackpackers',
    summary:
      'A Colorado nonprofit dedicated to closing the economic equity gap in outdoor recreation by providing subsidized or fully covered gear, permits, and guided instruction for backpacking, skiing, climbing, and rafting.',
    highlights: [
      'Zero-cost gear outfitting for backcountry trips',
      'Guided alpine backpacking, skiing, and whitewater rafting',
      'Pathways into outdoor guiding and conservation careers',
    ],
    imageUrl: EDITORIAL_IMAGES.camping,
    source: 'curated',
  },
  {
    id: 'vibe-tribe-adventures',
    name: 'Vibe Tribe Adventures',
    discipline: 'Hiking & Camping',
    orgType: 'Outdoor Club',
    region: 'West',
    location: 'Denver, CO',
    founded: '2020',
    chapterCount: 'Colorado & Mountain West',
    website: 'https://vibetribeadventures.org',
    instagram: '@vibetribeadventures',
    summary:
      'Denver-based adventure collective crafting inclusive mountain experiences—from snowshoeing, paddleboarding, and kayaking to guided hikes—while supporting emerging urban outdoor leaders and entrepreneurs.',
    highlights: [
      'Year-round Colorado snowshoe, SUP, and hiking events',
      'Outdoor leadership accelerator for community guides',
      'Culturally grounded wellness and mountain trips',
    ],
    imageUrl: EDITORIAL_IMAGES.camping,
    source: 'curated',
  },
  {
    id: 'edge-outdoors',
    name: 'EDGE Outdoors',
    discipline: 'Climbing & Snow',
    orgType: 'Nonprofit & Advocacy',
    region: 'West',
    location: 'Seattle, WA (Pacific Northwest)',
    founded: '2020',
    chapterCount: 'Washington & PNW',
    website: 'https://edgeoutdoors.org',
    instagram: '@edgeoutdoorspnw',
    summary:
      'Founded by Annette Diggs, EDGE Outdoors cultivates equity, safety, and professional instructor pipelines for Black, Indigenous, and Women of Color in skiing, snowboarding, and backcountry snowsports.',
    highlights: [
      'Learn-to-ski and snowboard clinics with gear & lift passes',
      'PSIA/AASI snowsports instructor certification support',
      'Backcountry avalanche education scholarships',
    ],
    imageUrl: EDITORIAL_IMAGES.climbing,
    source: 'curated',
  },
  {
    id: 'climbers-of-color',
    name: 'Climbers of Color',
    discipline: 'Climbing & Snow',
    orgType: 'Nonprofit & Advocacy',
    region: 'West',
    location: 'Seattle, WA (Cascades)',
    founded: '2016',
    chapterCount: 'Pacific Northwest',
    website: 'https://climbersofcolor.org',
    instagram: '@climbersofcolor',
    summary:
      'A Pacific Northwest nonprofit developing technical alpine, glacier, ice, and rock climbing leaders of color through structured mentorship courses, avalanche training, and Cascade Range summit teams.',
    highlights: [
      'Glacier travel, crevasse rescue & mountaineering courses',
      'Peer-led mentorship from gym to alpine summits',
      'Scholarships for technical mountain gear and AIARE classes',
    ],
    imageUrl: EDITORIAL_IMAGES.climbing,
    source: 'curated',
  },
  {
    id: 'diving-with-a-purpose',
    name: 'Diving with a Purpose',
    discipline: 'Water, Surf & Dive',
    orgType: 'Land & Stewardship',
    region: 'International',
    location: 'U.S. & Caribbean Maritime Sites',
    founded: '2003',
    chapterCount: 'International Field Teams',
    website: 'https://divingwithapurpose.org',
    instagram: '@divingwithapurpose',
    summary:
      'A maritime archaeology and ocean conservation program training Black and diverse scuba divers to map, document, and protect historic shipwrecks—including sunken vessels of the Transatlantic Slave Trade—and coral reefs.',
    highlights: [
      'Underwater archaeological mapping & preservation training',
      'Youth Diving with a Purpose (YDWP) marine science track',
      'Coral reef restoration and maritime heritage protection',
    ],
    imageUrl: EDITORIAL_IMAGES.water,
    source: 'curated',
  },
  {
    id: 'universal-sailing-club',
    name: 'Universal Sailing Club',
    discipline: 'Water, Surf & Dive',
    orgType: 'Outdoor Club',
    region: 'South',
    location: 'Atlanta, GA · Lake Lanier & Coastal',
    founded: '1988',
    chapterCount: 'Southeast & National Flotillas',
    website: 'https://universalsailingclub.org',
    instagram: '@universalsailingclub',
    summary:
      'One of the premier African American sailing clubs in the United States, fostering seamanship, ASA certification pathways, weekend lake regattas, and annual Caribbean sailing flotillas.',
    highlights: [
      'Hands-on keelboat sailing clinics & crew placement',
      'Annual international bareboat charter flotillas',
      'Youth maritime exposure and boating safety workshops',
    ],
    imageUrl: EDITORIAL_IMAGES.water,
    source: 'curated',
  },
  {
    id: 'brown-folks-fishing',
    name: 'Brown Folks Fishing',
    discipline: 'Water, Surf & Dive',
    orgType: 'Coalition & Media',
    region: 'National',
    location: 'National · Freshwater & Coastal',
    founded: '2018',
    chapterCount: 'Nationwide Angler Network',
    website: 'https://brownfolksfishing.com',
    instagram: '@brownfolksfishing',
    summary:
      'A community-driven platform building inclusive space for Black, Indigenous, and anglers of color across fly fishing, conventional angling, clean-water conservation, and equitable guide representation.',
    highlights: [
      'Fly-casting clinics and river stewardship days',
      'Directory of BIPOC fishing guides and outfitters',
      'Watershed advocacy and ethical angling education',
    ],
    imageUrl: EDITORIAL_IMAGES.water,
    source: 'curated',
  },
  {
    id: 'girltrek',
    name: 'GirlTrek',
    discipline: 'Cycling & Running',
    orgType: 'Nonprofit & Advocacy',
    region: 'National',
    location: 'Washington, D.C. · 1M+ Walkers',
    founded: '2010',
    chapterCount: 'National Walking Crews',
    website: 'https://girltrek.org',
    instagram: '@girltrek',
    summary:
      'Founded by T. Morgan Dixon and Vanessa Garrison, GirlTrek is the largest public health movement for Black women and girls in the U.S., mobilizing daily walking crews, historic freedom-trail pilgrimages, and neighborhood greenway advocacy.',
    highlights: [
      'Daily neighborhood walking crews in hundreds of cities',
      'Harriet Tubman & historic trail walking pilgrimages',
      'Black History Bootcamp audio walks and wellness pledges',
    ],
    imageUrl: EDITORIAL_IMAGES.cycling,
    source: 'curated',
  },
  {
    id: 'black-trail-runners',
    name: 'Black Trail Runners',
    discipline: 'Cycling & Running',
    orgType: 'Outdoor Club',
    region: 'International',
    location: 'UK & U.S. Trail Communities',
    founded: '2020',
    chapterCount: 'International Trail Crew',
    website: 'https://blacktrailrunners.run',
    instagram: '@blacktrailrunners',
    summary:
      'A community and campaigning charity expanding Black participation, navigation confidence, and representation in trail running and ultramarathons through group trail runs, race entries, and skill clinics.',
    highlights: [
      'Guided trail-running meetups for road-to-trail transitions',
      'Navigation, fueling, and ultra-distance prep workshops',
      'Advocacy for inclusive race photography and safety',
    ],
    imageUrl: EDITORIAL_IMAGES.cycling,
    source: 'curated',
  },
  {
    id: 'all-mountain-brothers',
    name: 'All Mountain Brothers',
    discipline: 'Cycling & Running',
    orgType: 'Outdoor Club',
    region: 'National',
    location: 'National · MTB Trail Network',
    founded: '2018',
    chapterCount: 'National Mountain Bike Crew',
    website: 'https://allmountainbrothers.com',
    instagram: '@allmountainbrothers',
    summary:
      'Dedicated to celebrating and growing Black participation in mountain biking through singletrack group rides, trail-building days, skills progressions, and visual storytelling across North American bike parks.',
    highlights: [
      'Singletrack meetups and bike park weekend trips',
      'MTB suspension, bike setup & trail-skills sessions',
      'Representation across mountain bike media and brands',
    ],
    imageUrl: EDITORIAL_IMAGES.cycling,
    source: 'curated',
  },
  {
    id: 'black-outside',
    name: 'Black Outside, Inc.',
    discipline: 'Hiking & Camping',
    orgType: 'Nonprofit & Advocacy',
    region: 'Southwest',
    location: 'San Antonio, TX',
    founded: '2018',
    chapterCount: 'Texas & Southwest',
    website: 'https://blackoutside.org',
    instagram: '@blackoutsideinc',
    summary:
      'A Texas nonprofit reconnecting Black youth and families to the outdoors through culturally grounded programming including Camp Founder Girls, Brother’s on the Trail, and Texas state park leadership camps.',
    highlights: [
      'Camp Founder Girls summer camp honoring Black women pioneers',
      'Youth outdoor leadership & environmental education',
      'Texas Hill Country camping and trail stewardship',
    ],
    imageUrl: EDITORIAL_IMAGES.camping,
    source: 'curated',
  },
  {
    id: 'soul-fire-farm',
    name: 'Soul Fire Farm',
    discipline: 'Land & Heritage',
    orgType: 'Land & Stewardship',
    region: 'Northeast',
    location: 'Petersburgh, NY',
    founded: '2010',
    chapterCount: '80-Acre Community Farm',
    website: 'https://soulfirefarm.org',
    instagram: '@soulfirefarm',
    summary:
      'An Afro-Indigenous centered community farm practicing regenerative agriculture, Afro-ecological land stewardship, farmer immersion training, and food sovereignty advocacy across the Northeast and nationwide.',
    highlights: [
      'FIRE Immersion training for Black & Brown land stewards',
      'Afro-Indigenous regenerative farming & forest tending',
      'Uprooting Racism in the Food System policy initiatives',
    ],
    imageUrl: EDITORIAL_IMAGES.camping,
    source: 'curated',
  },
  {
    id: 'compton-cowboys',
    name: 'Compton Cowboys',
    discipline: 'Land & Heritage',
    orgType: 'Land & Stewardship',
    region: 'West',
    location: 'Compton, CA',
    founded: '2017',
    chapterCount: 'Richland Farms Equestrian Ranch',
    website: 'https://comptoncowboys.com',
    instagram: '@comptoncowboys',
    summary:
      'Carrying forward the legacy of the Compton Jr. Posse, the Compton Cowboys preserve Black equestrian culture, horsemanship, and urban ranching while mentoring youth in discipline, trail riding, and animal care.',
    highlights: [
      'Urban ranching and equestrian stewardship in Los Angeles',
      'Youth mentorship through horsemanship and trail rides',
      'Preserving historic Black cowboy heritage in the West',
    ],
    imageUrl: EDITORIAL_IMAGES.hero,
    source: 'curated',
  },
  {
    id: 'melanin-base-camp',
    name: 'Melanin Base Camp',
    discipline: 'Birding & Conservation',
    orgType: 'Coalition & Media',
    region: 'National',
    location: 'National · Digital Media & Guide',
    founded: '2016',
    chapterCount: 'Coalition & Editorial Hub',
    website: 'https://melaninbasecamp.com',
    instagram: '@melaninbasecamp',
    summary:
      'Founded by Danielle Williams, Melanin Base Camp is a leading digital media hub and advocacy platform amplifying Black, Indigenous, and People of Color athletes, writers, and conservationists across outdoor sports.',
    highlights: [
      'Editorial storytelling & guidebooks by BIPOC adventurers',
      'Co-founder of the Diversify Outdoors coalition',
      'Guide directory and outdoor brand accountability work',
    ],
    imageUrl: EDITORIAL_IMAGES.hero,
    source: 'curated',
  },
  {
    id: 'black-in-marine-science',
    name: 'Black in Marine Science (BIMS)',
    discipline: 'Water, Surf & Dive',
    orgType: 'Nonprofit & Advocacy',
    region: 'International',
    location: 'Spokane, WA · Global Network',
    founded: '2020',
    chapterCount: 'Global Marine Scientists & Divers',
    website: 'https://www.blackinmarinescience.org',
    instagram: '@blackinmarinescience',
    summary:
      'Founded by Dr. Tiara Moore, BIMS celebrates Black marine scientists, advances ocean literacy and environmental justice, hosts BIMS Week symposia, and builds scuba and coastal science pathways for Black youth and researchers.',
    highlights: [
      'Annual BIMS Week ocean science & dive symposium',
      'BIMS TV ocean literacy series and youth fellowships',
      'Coastal conservation & coral reef restoration fieldwork',
    ],
    imageUrl: EDITORIAL_IMAGES.water,
    source: 'curated',
  },
  {
    id: 'minorities-in-shark-sciences',
    name: 'Minorities in Shark Sciences (MISS)',
    discipline: 'Water, Surf & Dive',
    orgType: 'Nonprofit & Advocacy',
    region: 'South',
    location: 'Sarasota, FL · National & Global',
    founded: '2020',
    chapterCount: 'International Fellows Network',
    website: 'https://www.misselasmo.org',
    instagram: '@miss_elasmo',
    summary:
      'Co-founded by Jasmin Graham, Carlee Jackson, Amani Webber-Schultz, and Jaida Elcock, MISS eliminates financial barriers for women and gender minorities of color entering shark science, marine fieldwork, and ocean conservation.',
    highlights: [
      'Fully funded at-sea shark research workshops for students',
      'Summer marine biology camps for middle and high school youth',
      'Fellowships, mentorship, and scientific publishing support',
    ],
    imageUrl: EDITORIAL_IMAGES.water,
    source: 'curated',
  },
  {
    id: 'greening-youth-foundation',
    name: 'Greening Youth Foundation',
    discipline: 'Birding & Conservation',
    orgType: 'Nonprofit & Advocacy',
    region: 'South',
    location: 'Atlanta, GA · National Corps',
    founded: '2007',
    chapterCount: 'National Public Lands Corps',
    website: 'https://gyfoundation.org',
    instagram: '@greeningyouth',
    summary:
      'Founded by Angelou Ezeilo, Greening Youth Foundation connects underrepresented youth and young adults to paid conservation internships, National Park Service and U.S. Forest Service trail crews, and urban sustainability careers.',
    highlights: [
      'HBCU & Youth Conservation Corps paid trail placements',
      'Public Schoolhouse urban garden & watershed programs',
      'Partnerships with NPS, USFS, and state parks nationwide',
    ],
    imageUrl: EDITORIAL_IMAGES.hero,
    source: 'curated',
  },
  {
    id: 'black-girls-run',
    name: 'Black Girls RUN!',
    discipline: 'Cycling & Running',
    orgType: 'Outdoor Club',
    region: 'National',
    location: 'Atlanta, GA · 70+ Chapters',
    founded: '2009',
    chapterCount: '70+ Local Run Groups',
    website: 'https://blackgirlsrun.com',
    instagram: '@officialblackgirlsrun',
    summary:
      'Founded by Toni Carey and Ashley Hicks, Black Girls RUN! mobilizes hundreds of thousands of Black women across 70+ city chapters for weekly group runs, trail race teams, half-marathon training, and community health advocacy.',
    highlights: [
      'Weekly beginner-friendly group runs across 70+ U.S. cities',
      'Annual Preserve the Pavement national race weekend',
      'Ambassador-led pacing groups for 5Ks through marathons',
    ],
    imageUrl: EDITORIAL_IMAGES.cycling,
    source: 'curated',
  },
  {
    id: 'black-men-run',
    name: 'Black Men Run',
    discipline: 'Cycling & Running',
    orgType: 'Outdoor Club',
    region: 'National',
    location: 'Atlanta, GA · 50+ Chapters',
    founded: '2013',
    chapterCount: '50+ City Chapters',
    website: 'https://blackmenrun.com',
    instagram: '@blackmenrun',
    summary:
      'Co-founded by Jason L. Russell and Edward Walton, Black Men Run builds a healthy brotherhood encouraging Black men to get active through weekly city park runs, trail races, mentorship, and preventive wellness outreach.',
    highlights: [
      'Weekly group runs in 50+ U.S. and international cities',
      'All-pace running brotherhood welcoming first-time runners',
      'National meetups at major marathons and trail events',
    ],
    imageUrl: EDITORIAL_IMAGES.cycling,
    source: 'curated',
  },
  {
    id: 'full-circle-everest',
    name: 'Full Circle Everest',
    discipline: 'Climbing & Snow',
    orgType: 'Nonprofit & Advocacy',
    region: 'West',
    location: 'Colorado · Global Expeditions',
    founded: '2021',
    chapterCount: 'Mountaineering Collective',
    website: 'https://www.fullcircleexpeditions.com',
    instagram: '@fullcircleeverest',
    summary:
      'The historic first all-Black mountaineering team to summit Mount Everest in 2022, now operating as a nonprofit expanding high-altitude representation, outdoor leadership fellowships, and youth mountaineering inspiration.',
    highlights: [
      'Historic 2022 all-Black Mount Everest summit expedition',
      'High-altitude mentorship and expedition storytelling',
      'Youth speaking tours and alpine barrier-removal initiatives',
    ],
    imageUrl: EDITORIAL_IMAGES.climbing,
    source: 'curated',
  },
  {
    id: 'outdoor-journal-tour',
    name: 'The Outdoor Journal Tour',
    discipline: 'Hiking & Camping',
    orgType: 'Outdoor Club',
    region: 'South',
    location: 'Atlanta, GA · National Chapters',
    founded: '2015',
    chapterCount: 'National #WeHikeToHeal Network',
    website: 'https://www.outdoorjournaltour.com',
    instagram: '@outdoorjournaltour',
    summary:
      'Blending guided hiking with reflective journaling and mindfulness, The Outdoor Journal Tour founded the #WeHikeToHeal movement to help Black women and marginalized communities reconnect with nature as restorative practice.',
    highlights: [
      'Annual #WeHikeToHeal month of guided community hikes',
      'Nature journaling retreats and mindfulness trail circles',
      'Chapter leaders hosting monthly wellness walks nationwide',
    ],
    imageUrl: EDITORIAL_IMAGES.hero,
    source: 'curated',
  },
  {
    id: 'wild-diversity',
    name: 'Wild Diversity',
    discipline: 'Hiking & Camping',
    orgType: 'Nonprofit & Advocacy',
    region: 'West',
    location: 'Portland, OR (Pacific Northwest)',
    founded: '2018',
    chapterCount: 'Oregon & Pacific Northwest',
    website: 'https://wilddiversity.com',
    instagram: '@wilddiversity',
    summary:
      'Founded by Mercy M’fon in Portland, Wild Diversity helps BIPOC and LGBTQ2S+ communities build personal connections to Pacific Northwest forests, rivers, and coast through sliding-scale trips, youth workshops, and an accessible gear library.',
    highlights: [
      'Community Gear Library providing free tents, packs & boots',
      'Backpacking, canoeing, foraging, and wilderness first aid',
      'Youth outdoor leadership and sliding-scale adventure access',
    ],
    imageUrl: EDITORIAL_IMAGES.camping,
    source: 'curated',
  },
  {
    id: 'braided-seeds',
    name: 'Braided Seeds',
    discipline: 'Land & Heritage',
    orgType: 'Land & Stewardship',
    region: 'West',
    location: 'Seattle & Tacoma, WA',
    founded: '2021',
    chapterCount: 'Puget Sound & Washington',
    website: 'https://braidedseeds.org',
    instagram: '@braidedseeds',
    summary:
      'Founded by Ashleigh Shoecraft, Braided Seeds is a Black-centering nonprofit removing barriers to land and nature through restorative retreats, ecological wellness workshops, and gentle outdoor reconnection for Black families and youth.',
    highlights: [
      'Restorative land retreats centered on Black rest and joy',
      'Ecological education and neighborhood green-space walks',
      'Intergenerational outdoor programming across Washington',
    ],
    imageUrl: EDITORIAL_IMAGES.camping,
    source: 'curated',
  },
  {
    id: 'federation-of-black-cowboys',
    name: 'Federation of Black Cowboys',
    discipline: 'Land & Heritage',
    orgType: 'Land & Stewardship',
    region: 'Northeast',
    location: 'Queens & Brooklyn, NY',
    founded: '1994',
    chapterCount: 'New York City Stables',
    website: 'https://www.thefederationofblackcowboys.com',
    instagram: '@federationofblackcowboys',
    summary:
      'Preserving the storied legacy of African American cowboys, wranglers, and horsemen in the American West through urban horsemanship instruction, community parades, trail rides, and youth mentorship in New York City.',
    highlights: [
      'Urban youth horsemanship & equine care education',
      'Historical preservation of Black Western heritage',
      'Community trail rides and educational cultural events',
    ],
    imageUrl: EDITORIAL_IMAGES.hero,
    source: 'curated',
  },
  {
    id: 'african-american-owned-campgrounds',
    name: 'African-American Owned Campgrounds',
    discipline: 'Land & Heritage',
    orgType: 'Coalition & Media',
    region: 'National',
    location: 'National Campground Directory',
    founded: '2018',
    chapterCount: 'Nationwide Campground Index',
    website: 'https://africanamericanownedcampgrounds.com',
    instagram: '@blackownedcampgrounds',
    summary:
      'A national directory helping campers, overlanders, and RV travelers discover and support Black-owned campgrounds, cabins, glamping retreats, and historic outdoor recreation landholdings across the United States.',
    highlights: [
      'State-by-state guide to Black-owned RV parks and camp properties',
      'Highlights historic family-owned lakeside & woodland retreats',
      'Supports economic sustainability for Black landowners',
    ],
    imageUrl: EDITORIAL_IMAGES.camping,
    source: 'curated',
  },
  {
    id: 'diversify-outdoors',
    name: 'Diversify Outdoors',
    discipline: 'Birding & Conservation',
    orgType: 'Coalition & Media',
    region: 'National',
    location: 'National Coalition Network',
    founded: '2018',
    chapterCount: 'Cross-Organization Coalition',
    website: 'https://diversifyoutdoors.com',
    instagram: '@diversifyoutdoors',
    summary:
      'A coalition of Black, Indigenous, and diverse outdoor influencers, grassroots club founders, athletes, and conservationists working collectively to promote equity, representation, and inclusive access across outdoor recreation.',
    highlights: [
      'Coalition connecting dozens of affinity outdoor organizations',
      'Industry accountability and equitable media advocacy',
      'Shared speaker roster, guides, and grassroots event calendar',
    ],
    imageUrl: EDITORIAL_IMAGES.hero,
    source: 'curated',
  },
];

export interface SeedOuting {
  id: string;
  title: string;
  orgId: string;
  orgName: string;
  discipline: Discipline;
  dateLabel: string;
  location: string;
  region: Region;
  difficulty: 'Beginner Friendly' | 'Moderate' | 'Challenging' | 'All Levels';
  maxSpots: number;
  hostName: string;
  description: string;
  source: 'curated' | 'community';
  hostId?: string;
}

export const CURATED_OUTINGS: SeedOuting[] = [
  {
    id: 'outing-shenandoah-sunrise',
    title: 'Blue Ridge Sunrise Loop & Coffee Boil',
    orgId: 'soul-trak-outdoors',
    orgName: 'Soul Trak Outdoors',
    discipline: 'Hiking & Camping',
    dateLabel: 'Sat, Dec 6 · 7:30 AM EST',
    location: 'Old Rag Trailhead, Shenandoah, VA',
    region: 'Northeast',
    difficulty: 'Moderate',
    maxSpots: 24,
    hostName: 'Marcus Vance',
    description:
      'A 5.4-mile autumn ridge loop followed by camp stove pour-over coffee and trailhead debrief. Carpool coordination open in Field Feed.',
    source: 'curated',
  },
  {
    id: 'outing-rockaway-dawn-patrol',
    title: 'Cold-Water Dawn Patrol & Ocean Safety Clinic',
    orgId: 'laru-beya-collective',
    orgName: 'Laru Beya Collective',
    discipline: 'Water, Surf & Dive',
    dateLabel: 'Sun, Dec 7 · 8:00 AM EST',
    location: 'Beach 67th St, Rockaway Beach, NY',
    region: 'Northeast',
    difficulty: 'Beginner Friendly',
    maxSpots: 18,
    hostName: 'Nadia Baptiste',
    description:
      'Guided winter surf fundamentals, rip-current reading, and warm herbal tea on the boardwalk afterward. 5/4mm loaner wetsuits available.',
    source: 'curated',
  },
  {
    id: 'outing-bliss-birding-walk',
    title: 'Winter Waterfowl & Songbird Field Walk',
    orgId: 'backyard-basecamp',
    orgName: 'Backyard Basecamp',
    discipline: 'Birding & Conservation',
    dateLabel: 'Sat, Dec 13 · 8:30 AM EST',
    location: 'BLISS Meadows, Baltimore, MD',
    region: 'Northeast',
    difficulty: 'All Levels',
    maxSpots: 30,
    hostName: 'Dr. Keisha Alston',
    description:
      'Slow-paced 2-mile guided birding walk spotting migrating waterfowl and winter residents. Spare binoculars provided at check-in.',
    source: 'curated',
  },
  {
    id: 'outing-gunks-toprope',
    title: 'Intro to Outdoor Top-Rope & Anchor Basics',
    orgId: 'brothers-of-climbing',
    orgName: 'Brothers of Climbing',
    discipline: 'Climbing & Snow',
    dateLabel: 'Sun, Dec 14 · 9:00 AM EST',
    location: 'Shawangunk Ridge, New Paltz, NY',
    region: 'Northeast',
    difficulty: 'Moderate',
    maxSpots: 14,
    hostName: 'Devon Osei',
    description:
      'Gym-to-crag transition session covering belay checks, outdoor rock ethics, and top-rope climbs on classic quartz conglomerate lines.',
    source: 'curated',
  },
  {
    id: 'outing-front-range-gravel',
    title: 'No-Drop Clear Creek Gravel & Greenway Ride',
    orgId: 'black-girls-do-bike',
    orgName: 'Black Girls Do Bike',
    discipline: 'Cycling & Running',
    dateLabel: 'Sat, Dec 20 · 9:00 AM MST',
    location: 'Golden Trailhead, Golden, CO',
    region: 'West',
    difficulty: 'Beginner Friendly',
    maxSpots: 28,
    hostName: 'Tasha Coleman',
    description:
      '18-mile scenic paved and crushed-gravel social ride with two pace groups and a mechanical sweep. Helmets required.',
    source: 'curated',
  },
  {
    id: 'outing-atlanta-sweetwater-journal',
    title: '#WeHikeToHeal Creekside Walk & Journal Circle',
    orgId: 'outdoor-journal-tour',
    orgName: 'The Outdoor Journal Tour',
    discipline: 'Hiking & Camping',
    dateLabel: 'Sun, Dec 21 · 9:30 AM EST',
    location: 'Sweetwater Creek State Park, Lithia Springs, GA',
    region: 'South',
    difficulty: 'Beginner Friendly',
    maxSpots: 35,
    hostName: 'Aaliyah Monroe',
    description:
      'An intentional 3-mile red-trail river walk pausing at the historic mill ruins for guided nature journaling and reflection.',
    source: 'curated',
  },
  {
    id: 'outing-forest-park-gear-clinic',
    title: 'Backcountry Layering Clinic & Forest Park Loop',
    orgId: 'wild-diversity',
    orgName: 'Wild Diversity',
    discipline: 'Hiking & Camping',
    dateLabel: 'Sat, Dec 27 · 10:00 AM PST',
    location: 'Lower Macleay Park, Portland, OR',
    region: 'West',
    difficulty: 'All Levels',
    maxSpots: 22,
    hostName: 'Jordan Ellis',
    description:
      'Hands-on winter rain-gear and pack-fit demonstration using our community gear library, followed by a 4-mile old-growth forest hike.',
    source: 'curated',
  },
  {
    id: 'outing-texas-hill-country-camp',
    title: 'Pedernales Falls Family Camp & Stargazing Night',
    orgId: 'black-outside',
    orgName: 'Black Outside, Inc.',
    discipline: 'Hiking & Camping',
    dateLabel: 'Sat, Jan 3 · 2:00 PM CST',
    location: 'Pedernales Falls State Park, Johnson City, TX',
    region: 'Southwest',
    difficulty: 'All Levels',
    maxSpots: 30,
    hostName: 'Malik Henderson',
    description:
      'Overnight beginner campout featuring tent setup demos, campfire cooking, limestone river exploration, and dark-sky telescope viewing.',
    source: 'curated',
  },
];

export interface SeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRegion: string;
  orgId: string;
  orgName: string;
  category:
    | 'Trail Report'
    | 'Trip Recap'
    | 'Carpool & Gear'
    | 'Conservation'
    | 'Introduction';
  title: string;
  body: string;
  location: string;
  timestampLabel: string;
  source: 'curated' | 'community';
}

export const CURATED_POSTS: SeedPost[] = [
  {
    id: 'seed-post-1',
    authorId: 'curated-editorial-1',
    authorName: 'Imani Brooks',
    authorRegion: 'Seattle, WA',
    orgId: 'edge-outdoors',
    orgName: 'EDGE Outdoors',
    category: 'Carpool & Gear',
    title: 'Snoqualmie Pass early season gear library & 3 carpool seats from South Seattle',
    body: 'Opening up three seats in my Outback heading up to Summit West next Saturday morning for the beginner snowboard progression clinic. Also have two extra pairs of waterproof mittens and size 9 boots available to borrow for anyone attending their first snow day.',
    location: 'Snoqualmie Pass, WA',
    timestampLabel: '2 days ago',
    source: 'curated',
  },
  {
    id: 'seed-post-2',
    authorId: 'curated-editorial-2',
    authorName: 'Derrick Holloway',
    authorRegion: 'St. Louis, MO',
    orgId: 'black-people-who-hike',
    orgName: 'Black People Who Hike',
    category: 'Trail Report',
    title: 'Castlewood State Park River Scene Trail conditions after rain',
    body: 'Just wrapped a 6-mile sunrise loop along the bluffs. Limestone overlooks are dry and crystal clear, though the lower Meramec River flats have a few muddy switchbacks—waterproof trail runners or boots recommended if your crew is heading out this weekend.',
    location: 'Ballwin, MO',
    timestampLabel: '4 days ago',
    source: 'curated',
  },
  {
    id: 'seed-post-3',
    authorId: 'curated-editorial-3',
    authorName: 'Zora Mensah',
    authorRegion: 'Baltimore, MD',
    orgId: 'backyard-basecamp',
    orgName: 'Backyard Basecamp',
    category: 'Conservation',
    title: 'Native meadow seeding volunteer Saturday at BLISS Meadows',
    body: 'We cleared invasive mugwort across the east slope last month and are planting native milkweed, black-eyed Susan, and little bluestem seed mixes this weekend. Bring gloves and a refillable bottle—hot cider and lunch provided for all stewards.',
    location: 'Baltimore, MD',
    timestampLabel: '6 days ago',
    source: 'curated',
  },
  {
    id: 'seed-post-4',
    authorId: 'curated-editorial-4',
    authorName: 'Kendrick Boateng',
    authorRegion: 'Atlanta, GA',
    orgId: 'universal-sailing-club',
    orgName: 'Universal Sailing Club',
    category: 'Trip Recap',
    title: 'Autumn Lake Lanier crew clinic — 14 new sailors earned their first helm time',
    body: 'Steady 12-knot northwesterly wind all afternoon let every newcomer practice tacking, jibing, and man-overboard drills across three keelboats. Huge gratitude to our skippers who stayed past sunset to walk folks through ASA 101 study guides.',
    location: 'Lake Lanier, GA',
    timestampLabel: '1 week ago',
    source: 'curated',
  },
  {
    id: 'seed-post-5',
    authorId: 'curated-editorial-5',
    authorName: 'Sade Okafor',
    authorRegion: 'Portland, OR',
    orgId: 'wild-diversity',
    orgName: 'Wild Diversity',
    category: 'Introduction',
    title: 'New to the Pacific Northwest — looking for winter snowshoe and gravel partners',
    body: 'Relocated from Charlotte last month and excited to plug into local chapters around Portland and Hood River. I hike most weekends at a relaxed conversational pace and am eager to learn winter snowshoe routes and meet folks in Wild Diversity and Outdoor Afro.',
    location: 'Portland, OR',
    timestampLabel: '1 week ago',
    source: 'curated',
  },
];
