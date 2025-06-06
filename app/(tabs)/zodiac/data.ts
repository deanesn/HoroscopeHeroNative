import { Zodiac } from './types';

export const zodiacSigns: Zodiac[] = [
  {
    name: 'Aries',
    dates: 'March 21 - April 19',
    element: 'Fire',
    modality: 'Cardinal',
    rulingPlanet: 'Mars',
    description: 'Aries are natural leaders, competitive and energetic. They are known for their courage and determination.',
    color: '#FF6B6B',
    about: 'Aries is the first sign of the zodiac, and that\'s exactly how they like to be seen: as the first. Aries are natural leaders, competitive and energetic. They are known for their courage, determination, and enthusiasm.',
    positiveTraits: ['Courageous', 'Determined', 'Confident', 'Enthusiastic', 'Optimistic', 'Honest'],
    areasToWatch: ['Impatience', 'Impulsiveness', 'Short temper', 'Aggressiveness'],
    bestMatches: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
    famousPeople: ['Robert Downey Jr.', 'Lady Gaga', 'Reese Witherspoon', 'Emma Watson']
  },
  {
    name: 'Taurus',
    dates: 'April 20 - May 20',
    element: 'Earth',
    modality: 'Fixed',
    rulingPlanet: 'Venus',
    description: 'Taurus is reliable, patient, and devoted. They appreciate beauty and comfort, with a strong connection to nature.',
    color: '#4CAF50',
    about: 'Taurus is an earth sign represented by the bull. Like their celestial spirit animal, Taureans enjoy relaxing in serene, bucolic environments surrounded by soft sounds, soothing aromas, and succulent flavors.',
    positiveTraits: ['Patient', 'Reliable', 'Devoted', 'Responsible', 'Stable', 'Loving'],
    areasToWatch: ['Stubbornness', 'Possessiveness', 'Inflexibility', 'Materialism'],
    bestMatches: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    famousPeople: ['Adele', 'Mark Zuckerberg', 'Dwayne Johnson', 'Penélope Cruz']
  },
  {
    name: 'Gemini',
    dates: 'May 21 - June 20',
    element: 'Air',
    modality: 'Mutable',
    rulingPlanet: 'Mercury',
    description: 'Gemini is expressive, quick-witted, and sociable. They are known for their adaptability and intellectual curiosity.',
    color: '#FFD700',
    about: 'Gemini is represented by the twins, and this air sign was interested in so many pursuits that it had to double itself. Because of these characteristics, Geminis are known for their agile minds and collaborative spirit.',
    positiveTraits: ['Adaptable', 'Outgoing', 'Intelligent', 'Curious', 'Versatile', 'Witty'],
    areasToWatch: ['Inconsistency', 'Superficiality', 'Indecisiveness', 'Restlessness'],
    bestMatches: ['Libra', 'Aquarius', 'Aries', 'Leo'],
    famousPeople: ['Angelina Jolie', 'Johnny Depp', 'Kanye West', 'Marilyn Monroe']
  },
  {
    name: 'Cancer',
    dates: 'June 21 - July 22',
    element: 'Water',
    modality: 'Cardinal',
    rulingPlanet: 'Moon',
    description: 'Cancer is deeply intuitive and sentimental. They are protective and care deeply about family and home.',
    color: '#00BCD4',
    about: 'Cancer is a cardinal water sign. Represented by the crab, this oceanic crustacean seamlessly weaves between the sea and shore representing Cancer\'s ability to exist in both emotional and material realms.',
    positiveTraits: ['Loyal', 'Emotional', 'Sympathetic', 'Tenacious', 'Nurturing', 'Protective'],
    areasToWatch: ['Moodiness', 'Oversensitivity', 'Clinginess', 'Manipulation'],
    bestMatches: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
    famousPeople: ['Tom Hanks', 'Meryl Streep', 'Princess Diana', 'Tom Cruise']
  },
  {
    name: 'Leo',
    dates: 'July 23 - August 22',
    element: 'Fire',
    modality: 'Fixed',
    rulingPlanet: 'Sun',
    description: 'Leo is dramatic, creative, and confident. They are natural performers who love to be in the spotlight.',
    color: '#FFA726',
    about: 'Leo is represented by the lion, and these spirited fire signs are the kings and queens of the celestial jungle. They\'re delighted to embrace their royal status: Vivacious, theatrical, and passionate, Leos love to bask in the spotlight.',
    positiveTraits: ['Generous', 'Creative', 'Cheerful', 'Humorous', 'Warm', 'Dignified'],
    areasToWatch: ['Arrogance', 'Stubbornness', 'Self-centeredness', 'Laziness'],
    bestMatches: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
    famousPeople: ['Jennifer Lopez', 'Barack Obama', 'Madonna', 'Daniel Radcliffe']
  },
  {
    name: 'Virgo',
    dates: 'August 23 - September 22',
    element: 'Earth',
    modality: 'Mutable',
    rulingPlanet: 'Mercury',
    description: 'Virgo is analytical, practical, and hardworking. They have an eye for detail and a drive for perfection.',
    color: '#8BC34A',
    about: 'Virgo is an earth sign historically represented by the goddess of wheat and agriculture. This association speaks to Virgo\'s deep-rooted presence in the material world. They are logical, practical, and systematic in their approach to life.',
    positiveTraits: ['Analytical', 'Hardworking', 'Reliable', 'Practical', 'Modest', 'Diligent'],
    areasToWatch: ['Criticism', 'Perfectionism', 'Shyness', 'Worry'],
    bestMatches: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
    famousPeople: ['Beyoncé', 'Michael Jackson', 'Mother Teresa', 'Keanu Reeves']
  },
  {
    name: 'Libra',
    dates: 'September 23 - October 22',
    element: 'Air',
    modality: 'Cardinal',
    rulingPlanet: 'Venus',
    description: 'Libra is diplomatic, fair-minded, and romantic. They seek harmony and balance in all aspects of life.',
    color: '#9C27B0',
    about: 'Libra is represented by the scales, an association that reflects this air sign\'s fixation on balance and harmony. Libra is obsessed with symmetry and strives to create equilibrium in all areas of life.',
    positiveTraits: ['Diplomatic', 'Gracious', 'Fair-minded', 'Social', 'Cooperative', 'Peaceful'],
    areasToWatch: ['Indecision', 'Avoidance', 'Superficiality', 'Self-pity'],
    bestMatches: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
    famousPeople: ['Will Smith', 'Kim Kardashian', 'Bruno Mars', 'Gwyneth Paltrow']
  },
  {
    name: 'Scorpio',
    dates: 'October 23 - November 21',
    element: 'Water',
    modality: 'Fixed',
    rulingPlanet: 'Pluto, Mars',
    description: 'Scorpio is passionate, resourceful, and intense. They are known for their mystery and emotional depth.',
    color: '#7E57C2',
    about: 'Scorpio is one of the most misunderstood signs of the zodiac. Because of its incredible passion and power, Scorpio is often mistaken for a fire sign. In fact, Scorpio is a water sign that derives its strength from the psychic, emotional realm.',
    positiveTraits: ['Resourceful', 'Brave', 'Passionate', 'Stubborn', 'True Friend', 'Mysterious'],
    areasToWatch: ['Jealousy', 'Secretiveness', 'Resentment', 'Manipulation'],
    bestMatches: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
    famousPeople: ['Leonardo DiCaprio', 'Bill Gates', 'Julia Roberts', 'Drake']
  },
  {
    name: 'Sagittarius',
    dates: 'November 22 - December 21',
    element: 'Fire',
    modality: 'Mutable',
    rulingPlanet: 'Jupiter',
    description: 'Sagittarius is optimistic, adventurous, and philosophical. They love to explore and seek knowledge.',
    color: '#FF5722',
    about: 'Represented by the archer, Sagittarians are always on a quest for knowledge. The last fire sign of the zodiac, Sagittarius launches its many pursuits like blazing arrows, chasing after geographical, intellectual, and spiritual adventures.',
    positiveTraits: ['Generous', 'Idealistic', 'Great Humor', 'Adventurous', 'Enthusiastic', 'Optimistic'],
    areasToWatch: ['Promises', 'Impatience', 'Will Say Anything', 'Inconsistency'],
    bestMatches: ['Aries', 'Leo', 'Libra', 'Aquarius'],
    famousPeople: ['Brad Pitt', 'Taylor Swift', 'Jay-Z', 'Miley Cyrus']
  },
  {
    name: 'Capricorn',
    dates: 'December 22 - January 19',
    element: 'Earth',
    modality: 'Cardinal',
    rulingPlanet: 'Saturn',
    description: 'Capricorn is ambitious, disciplined, and practical. They are natural leaders with a strong drive for success.',
    color: '#795548',
    about: 'The last earth sign of the zodiac, Capricorn is represented by the sea goat, a mythological creature with the body of a goat and tail of a fish. This imagery speaks to Capricorn\'s ability to navigate both the material and emotional realms.',
    positiveTraits: ['Responsible', 'Disciplined', 'Self-control', 'Good managers', 'Practical', 'Patient'],
    areasToWatch: ['Know-it-all', 'Unforgiving', 'Condescending', 'Expecting the worst'],
    bestMatches: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    famousPeople: ['Michelle Obama', 'Bradley Cooper', 'Kate Middleton', 'Denzel Washington']
  },
  {
    name: 'Aquarius',
    dates: 'January 20 - February 18',
    element: 'Air',
    modality: 'Fixed',
    rulingPlanet: 'Uranus, Saturn',
    description: 'Aquarius is innovative, progressive, and humanitarian. They are visionaries who think outside the box.',
    color: '#2196F3',
    about: 'Despite the "aqua" in its name, Aquarius is actually the last air sign of the zodiac. Innovative, progressive, and shamelessly revolutionary, Aquarius is represented by the water bearer, the mystical healer who bestows water, or life, upon the land.',
    positiveTraits: ['Progressive', 'Original', 'Independent', 'Humanitarian', 'Intellectual', 'Inventive'],
    areasToWatch: ['Temperamental', 'Uncompromising', 'Aloof', 'Rebellious'],
    bestMatches: ['Gemini', 'Libra', 'Sagittarius', 'Aries'],
    famousPeople: ['Jennifer Aniston', 'Harry Styles', 'Oprah Winfrey', 'Cristiano Ronaldo']
  },
  {
    name: 'Pisces',
    dates: 'February 19 - March 20',
    element: 'Water',
    modality: 'Mutable',
    rulingPlanet: 'Neptune, Jupiter',
    description: 'Pisces is compassionate, artistic, and deeply intuitive. They are dreamers with a strong spiritual connection.',
    color: '#3F51B5',
    about: 'Pisces, a water sign, is the last constellation of the zodiac. It\'s symbolized by two fish swimming in opposite directions, representing the constant division of Pisces\'s attention between fantasy and reality.',
    positiveTraits: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle', 'Wise', 'Musical'],
    areasToWatch: ['Escapist', 'Idealistic', 'Oversensitive', 'Pessimistic'],
    bestMatches: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
    famousPeople: ['Rihanna', 'Justin Bieber', 'Elizabeth Taylor', 'Albert Einstein']
  }
];

export const zodiacDetails = zodiacSigns.reduce((acc, sign) => {
  acc[sign.name.toLowerCase()] = sign;
  return acc;
}, {} as Record<string, Zodiac>);