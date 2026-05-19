const translations = {
    pl: {
        search_placeholder: "Szukaj...",
        hero_title: "Oceniaj Dropy z Minecrafta!",
        top_title: "Top 3 Najwyżej Oceniane",
        all_title: "Wszystkie Dropy",
        search_results: 'Wyniki Wyszukiwania: "{query}"',
        loading_best: "Ładowanie najlepszych dropów...",
        loading_db: "Ładowanie bazy danych...",
        error_db: "Błąd łączenia z bazą danych.",
        no_search_results: "Brak wyników wyszukiwania.",
        discord_title: "Gotowy, by ocenić aktualizację?",
        discord_desc: "Wbij na nasz serwer Discord i użyj komendy /ocenka, aby zostawić recenzję!",
        discord_btn: "Dołącz na nasz Discord",
        copy_btn: "Kopiuj komendę do oceny",
        copy_success: "Skopiowano do schowka!",
        features_title: "Co nowego w tym dropie?",
        reviews_title: "Opinie Społeczności",
        sort_newest: "Najnowsze najpierw",
        sort_oldest: "Najstarsze najpierw",
        sort_highest: "Najlepiej oceniane",
        sort_lowest: "Najgorzej oceniane",
        show_all_langs: "Pokaż inne języki",
        empty_reviews_title: "Strasznie tu pusto...",
        empty_reviews_desc: "Bądź pierwszą osobą, która oceni ten drop! Zrób to na naszym Discordzie!",
        loading_reviews: "Ładowanie opinii...",
        error_reviews: "Błąd ładowania opinii z serwera.",
        footer_rights: "Wszelkie prawa zastrzeżone.",
        footer_made: "Stworzone przez QozaWorks dla społeczności",
        date: "Data:",
        review_id: "ID Opinii",
        discord_hint: "Użyj tej komendy na naszym Discordzie, aby dodać swoją opinię!",
        java: "Java:",
        bedrock: "Bedrock:"
    },
    en: {
        search_placeholder: "Search...",
        hero_title: "Rate Minecraft Drops!",
        top_title: "Top 3 Highest Rated",
        all_title: "All Drops",
        search_results: 'Search Results: "{query}"',
        loading_best: "Loading top drops...",
        loading_db: "Loading database...",
        error_db: "Error connecting to the database.",
        no_search_results: "No search results found.",
        discord_title: "Ready to rate the update?",
        discord_desc: "Join our Discord server and use the /review command to leave a review!",
        discord_btn: "Join our Discord",
        copy_btn: "Copy rating command",
        copy_success: "Copied to clipboard!",
        features_title: "What's new in this drop?",
        reviews_title: "Community Reviews",
        sort_newest: "Newest first",
        sort_oldest: "Oldest first",
        sort_highest: "Highest rated",
        sort_lowest: "Lowest rated",
        show_all_langs: "Show other languages",
        empty_reviews_title: "It's awfully quiet here...",
        empty_reviews_desc: "Be the first person to rate this drop! Do it on our Discord server!",
        loading_reviews: "Loading reviews...",
        error_reviews: "Error loading reviews from the server.",
        footer_rights: "All rights reserved.",
        footer_made: "Created by QozaWorks for the community of",
        date: "Date:",
        review_id: "Review ID",
        discord_hint: "Use this command on our Discord to add your review!",
        java: "Java:",
        bedrock: "Bedrock:"
    }
};

function getReviewWord(count, lang) {
    if (lang === 'en') {
        return count === 1 ? "review" : "reviews";
    } else {
        if (count === 1) return "opinia";
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) return "opinie";
        return "opinii";
    }
}
