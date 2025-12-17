
export const getInfoSections = () => [
  {
    id: 'our-model',
    preamble: 'Our Model',
    title: 'Flexible Supply That Moves With Your Business',
    description: 'BZION gives your business two practical ways to source products efficiently and reliably:',
    features: {
      items: [
        {
          icon: 'Warehouse' as const,
          title: 'Warehouse Fulfillment',
          description: 'Access ready-to-ship inventory from our strategically located warehouses. Get the stock you need when you need it, reduce carrying costs, and keep your operations running smoothly.',
        },
        {
          icon: 'Truck' as const,
          title: 'Direct from Manufacturers',
          description: 'Source products straight from trusted brands through dropshipping. Reduce procurement complexity, scale with demand, and maintain consistent access to high-demand items without overstocking.',
        },
      ],
    },
    closing: {
        title: "Seamless Operations",
        description: "Whether using warehouse stock or direct manufacturer supply, our logistics network ensures timely deliveries and predictable availability, so your business can focus on growth.",
        cta: {
            text: "Learn More",
            href: "/about"
        }
    },
    images: [
      {
        imageUrl: 'https://i.ibb.co/tTfsY4Z1/a.png',
        description: 'Warehouse with shelves of products',
        imageHint: 'warehouse shelves'
      },
      {
        imageUrl: 'https://i.ibb.co/tkYT2sH/Gemini-Generated-Image-8ud7z58ud7z58ud7.png',
        description: 'Factory production line',
        imageHint: 'factory line'
      },
      {
        imageUrl: 'https://i.ibb.co/d02nnZV0/c.png',
        description: 'Logistics and transportation',
        imageHint: 'logistics transport'
      },
       {
        imageUrl: 'https://i.ibb.co/NnYc5CWd/d.png',
        description: 'Supply chain diagram',
        imageHint: 'supply chain'
      },
    ],
    align: 'right' as const,
    bgColor: 'bg-primary',
  },
  {
    id: 'our-promise',
    preamble: 'Our Promise',
    title: 'Operational Excellence You Can Rely On',
    description: 'We are committed to providing a service that not only meets but exceeds expectations. Our operational excellence is built on several key pillars:',
    features: {
      items: [
        {
          icon: 'RefreshCw' as const,
          title: 'Predictable Supply',
          description: 'Our logistics network is designed for consistency and reliability, ensuring your business has the inventory it needs, when it needs it.',
        },
        {
          icon: 'Truck' as const,
          title: 'Fast and Efficient Fulfillment',
          description: 'With strategically located warehouses and streamlined processes, we deliver products quickly and efficiently to support your operations and growth.',
        },
         {
          icon: 'PackageCheck' as const,
          title: 'Careful Handling and Quality Assurance',
          description: 'Every order is managed with strict handling and packaging standards, ensuring products arrive in optimal condition and ready for sale.',
        },
        {
            icon: 'Star' as const,
            title: 'Long-Term Partnership',
            description: 'We go beyond delivery — providing insights, support, and solutions that help your business operate smoothly and scale sustainably.',
        },
      ],
    },
    images: [
      {
        imageUrl: 'https://i.ibb.co/tkYT2sH/Gemini-Generated-Image-8ud7z58ud7z58ud7.png',
        description: 'A handshake between business partners',
        imageHint: 'business handshake'
      },
      {
        imageUrl: 'https://i.ibb.co/k64syFCN/f.png',
        description: 'A delivery truck on the road',
        imageHint: 'delivery truck'
      },
      {
        imageUrl: 'https://i.ibb.co/xtK02Nvm/e.png',
        description: 'Quality control inspection',
        imageHint: 'quality inspection'
      },
       {
        imageUrl: 'https://i.ibb.co/tTHJ6jQn/h.png',
        description: 'A person analyzing data on a screen',
        imageHint: 'data analysis'
      },
    ],
    align: 'left' as const,
    bgColor: 'bg-background',
  },
];
