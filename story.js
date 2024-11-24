import fs from 'fs/promises';
import { table } from 'table';

const nftShortNames = {
  'Odyssey Testnet Commemorative IP Asset': '1st NFT',
  'Mahojin IP-Badge': 'Mahojin',
  '1Combo Story Badge': '1Combo',
  'Playarts X Story Odyssey Achievement Badge': 'Playarts',
  'RightsfuallyProtectionBadge': 'Rights',
  'Wand Badge': 'Wand',
  'SatoriBadge': 'Satori',
  'D3XBadge': 'Dx3',
  'Unleash Protocol Badge': 'Unleash',
  'ColorBadge': 'Color',
  'punkga.me Badge': 'punkga',
  'SOLO x Story Starts Badge': 'SOLO',
  'PiperX Odyssey Test Badge': 'PiperX',
  'Spotlight Odyssey Badge': 'Spotlight',
  'SNGLR IP Badge': 'SNGLR',
  'ImpossibleFinance': 'Impossible',
  'Standard Protocol StoryBadge': 'Standard',
  'Styreal x Story Odyssey Badge': 'Styreal',
  'Poster Badge': 'Poster',
  'Verio Badge': 'Verio',
  'BlockBook': 'BlockBook',
  'Nightly badge': 'NIGHTLY',
  'Globkins Badge': 'Globkins',
  'Koni Story Badge': 'KONI',
  'Story X JutsuWorld Badge': 'Jutsu',
};

const fetchWallets = async () => {
  const data = await fs.readFile('wallets.txt', 'utf-8');
  return data.split('\n').map(line => line.trim()).filter(wallet => wallet.length > 0);
};

const fetchNFTs = async (wallet) => {
  const url = `https://odyssey.storyscan.xyz/api/v2/addresses/${wallet}/tokens?type=ERC-721`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch NFT data for wallet: ${wallet}`);
    }
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error(`Error fetching wallet ${wallet}:`, error.message);
    return [];
  }
};

const colorize = (text, color) => {
  const colors = {
    green: '\x1b[32m', // Зеленый цвет
    red: '\x1b[31m',   // Красный цвет
    reset: '\x1b[0m',  // Сброс цвета
  };
  return `${colors[color]}${text}${colors.reset}`;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
  const wallets = await fetchWallets();
  const walletData = {};

  const totalBadgesAvailable = Object.keys(nftShortNames).length; // Общее количество возможных бейджей

  console.log('Загрузка данных NFT...\n');

  for (const wallet of wallets) {
    const nfts = await fetchNFTs(wallet);
    walletData[wallet] = nfts;

    await sleep(5000);
  }

  // Добавляем заголовок для столбца с подсчетом бейджей
  const headers = ['#', 'Wallet', ...Object.values(nftShortNames), 'Stats'];
  const tableRows = [headers];

  wallets.forEach((wallet, index) => {
    const nfts = walletData[wallet];

    // Считаем количество найденных бейджей
    let badgeCount = 0;

    const nftDetails = Object.entries(nftShortNames).map(([fullName, shortName]) => {
      const hasBadge = nfts.some(item => item.token.name === fullName);
      if (hasBadge) badgeCount++; // Увеличиваем счетчик, если бейдж найден
      return hasBadge
        ? colorize('✓', 'green')  // Зеленая галочка
        : colorize('X', 'red');   // Красный крест
    });

    // Добавляем статистику в последнюю колонку
    const stats = `${badgeCount}/${totalBadgesAvailable}`;
    tableRows.push([index + 1, wallet.slice(-4), ...nftDetails, stats]);
  });

  const config = {
    columns: Array(headers.length).fill({ alignment: 'center' }),
  };

  const tableOutput = table(tableRows, config);

  console.log(tableOutput);
};

main();
