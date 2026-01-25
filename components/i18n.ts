import { useApp, type Language } from './AppContext';

type Dict = Record<string, string>;

const pl: Dict = {
  // BottomNav
  'nav.home': 'Główna',
  'nav.plans': 'Plany',
  'nav.products': 'Produkty',
  'nav.schedule': 'Harmonogram',
  'nav.profile': 'Profil',

  // Login
  'login.tagline': 'Twój osobisty asystent diety',
  'login.tab.login': 'Zaloguj',
  'login.tab.signup': 'Rejestracja',
  'login.name.placeholder': 'Imię i nazwisko',
  'login.email.placeholder': 'Email',
  'login.password.placeholder': 'Hasło',
  'login.forgot': 'Nie pamiętasz hasła?',
  'login.wait': 'Proszę czekać…',
  'login.create': 'Utwórz konto',

  // Login errors
  'err.nameShort': 'Imię jest za krótkie',
  'err.badEmail': 'Nieprawidłowy adres email',
  'err.passShort': 'Hasło musi mieć min. 6 znaków',
  'err.generic': 'Coś poszło nie tak',

  // Main
  'main.welcomeBack': 'Witaj ponownie,',
  'main.kcalToday': 'kcal dziś',
  'main.target': 'cel',
  'main.progress': 'postęp',
  'main.quickActions': 'Szybkie akcje',
  'main.action.dietPlans': 'Plany diety',
  'main.action.addDish': 'Dodaj danie',
  'main.action.products': 'Produkty',
  'main.action.schedule': 'Harmonogram',
  'main.todaysMeals': 'Posiłki na dziś',
  'main.viewAll': 'Zobacz wszystko',
  'main.noMealsToday': 'Brak zaplanowanych posiłków na dziś',
  'main.scheduleMeals': 'Zaplanuj posiłki',
  'main.unknownDish': 'Nieznane danie',

  // Settings
  'settings.profile': 'Profil',
  'settings.personalInfo': 'Dane osobowe',
  'settings.healthGoals': 'Cele zdrowotne',
  'settings.preferences': 'Preferencje',
  'settings.notifications': 'Powiadomienia',
  'settings.enabled': 'Włączone',
  'settings.dailyTarget': 'Dzienny cel kalorii',
  'settings.account': 'Konto',
  'settings.privacy': 'Prywatność i bezpieczeństwo',
  'settings.help': 'Pomoc i wsparcie',
  'settings.language': 'Język',
  'settings.logout': 'Wyloguj',
  'settings.daysActive': 'Dni aktywności',
  'settings.mealsLogged': 'Zapisane posiłki',
  'settings.progress': 'Postęp',

  // Meal types
  'meal.breakfast': 'śniadanie',
  'meal.lunch': 'obiad',
  'meal.dinner': 'kolacja',
  'meal.snack': 'przekąska',

  // Schedule
'schedule.title': 'Harmonogram',
'schedule.mealsFor': 'Posiłki na {{date}}',
'schedule.noMealsThisDay': 'Brak zaplanowanych posiłków na ten dzień',
'schedule.addMealTitle': 'Dodaj posiłek',
'schedule.addModeLabel': 'Co dodać',
'schedule.addModeDish': 'Pojedyncze danie',
'schedule.addModePlan': 'Plan diety',
'schedule.dishLabel': 'Danie',
'schedule.selectDish': 'Wybierz danie',
'schedule.planLabel': 'Plan diety',
'schedule.selectPlan': 'Wybierz plan',
'schedule.mealTypeLabel': 'Typ posiłku',
'schedule.selectType': 'Wybierz typ',
'schedule.timeLabel': 'Godzina',
'schedule.selectTime': 'Wybierz godzinę',
'schedule.addMealButton': 'Dodaj posiłek',
'schedule.editTimeTitle': 'Zmień godzinę',
'schedule.editTime': 'Zmień',
'schedule.alert.calendarPermission.title': 'Brak uprawnień',
'schedule.alert.calendarPermission.msg': 'Zezwól aplikacji na dostęp do kalendarza.',
'schedule.alert.noGoogleCalendar.title': 'Brak kalendarza Google',
'schedule.alert.noGoogleCalendar.msg': 'Na urządzeniu nie znaleziono kalendarza Google do zapisu.',
'schedule.calendarPicker.title': 'Wybierz kalendarz',
'schedule.calendarPicker.label': 'Kalendarz Google',
'schedule.googleCalendar.label': 'Kalendarz Google',
'schedule.googleCalendar.none': 'nie wybrano',
'schedule.googleCalendar.select': 'Wybierz',
'schedule.googleCalendar.change': 'Zmień',
'schedule.googleCalendar.eventsTitle': 'Wydarzenia z Google',
'schedule.googleCalendar.loading': 'Wczytywanie…',
'schedule.googleCalendar.noEvents': 'Brak wydarzeń',
'schedule.googleCalendar.untitled': 'Bez tytułu',
'schedule.alert.calendarDelete.title': 'Nie udało się usunąć',
'schedule.alert.calendarDelete.msg': 'Wystąpił błąd podczas usuwania wydarzenia.',
'schedule.sync.okTitle': 'Zsynchronizowano',
'schedule.sync.okMsg': 'Zsynchronizowano z kalendarzem.',
'schedule.sync.errorTitle': 'Błąd',
'schedule.sync.errorMsg': 'Nie udało się zsynchronizować.',
'schedule.sync.button': 'Synchronizuj z kalendarzem',
'schedule.sync.inProgress': 'Synchronizuję…',
'schedule.alert.missingFields.title': 'Brak danych',
'schedule.alert.missingFields.msg': 'Wybierz typ posiłku i godzinę.',
'schedule.alert.missingDish.msg': 'Wybierz danie.',
'schedule.alert.missingPlan.msg': 'Wybierz plan diety.',
'schedule.alert.emptyPlan.title': 'Pusty plan',
'schedule.alert.emptyPlan.msg': 'Ten plan nie ma przypisanych dań.',
'schedule.alert.invalidDuration.title': 'Nieprawidłowa długość',
'schedule.alert.invalidDuration.msg': 'Nie udało się odczytać liczby dni z planu.',
'schedule.alert.invalidDate.title': 'Nieprawidłowa data',
'schedule.alert.invalidDate.msg': 'Nie udało się odczytać wybranej daty.',

// Common
'common.add': 'Dodaj',
'common.cancel': 'Anuluj',

// Weekdays (krótko)
'weekday.sun': 'N',
'weekday.mon': 'P',
'weekday.tue': 'W',
'weekday.wed': 'Ś',
'weekday.thu': 'C',
'weekday.fri': 'P',
'weekday.sat': 'S',

// Months
'month.january': 'Styczeń',
'month.february': 'Luty',
'month.march': 'Marzec',
'month.april': 'Kwiecień',
'month.may': 'Maj',
'month.june': 'Czerwiec',
'month.july': 'Lipiec',
'month.august': 'Sierpień',
'month.september': 'Wrzesień',
'month.october': 'Październik',
'month.november': 'Listopad',
'month.december': 'Grudzień',


// Products
'products.title': 'Baza produktów',
'products.searchPlaceholder': 'Szukaj produktów…',
'products.found': '{{count}} produktów',
'products.noneFound': 'Nie znaleziono produktów',
'products.kcal': 'kcal',

// Product categories
'productCat.all': 'Wszystkie',
'productCat.protein': 'Białko',
'productCat.grains': 'Zboża',
'productCat.vegetables': 'Warzywa',
'productCat.fats': 'Tłuszcze',
'productCat.dairy': 'Nabiał',

// Macros
'macro.protein': 'Białko',
'macro.carbs': 'Węglowodany',
'macro.fats': 'Tłuszcze',

// Diet plans
'dietPlans.title': 'Plany diety',
'dietPlans.searchPlaceholder': 'Szukaj planów diety…',
'dietPlans.noneFound': 'Nie znaleziono planów diety',

// Diet categories (UI labels)
'dietCat.all': 'Wszystkie',
'dietCat.balanced': 'Zbilansowane',
'dietCat.weightLoss': 'Redukcja',
'dietCat.vegan': 'Wegańskie',
'dietCat.keto': 'Keto',

// Common
'common.kcal': 'kcal',
'common.days': 'dni',

// Common 
'common.save': 'Zapisz',
'common.delete': 'Usuń',

// Diet plan editor
'planEditor.titleAdd': 'Dodaj plan diety',
'planEditor.titleEdit': 'Edytuj plan diety',
'planEditor.image': 'Zdjęcie planu',
'planEditor.addImage': 'Dodaj zdjęcie',
'planEditor.name': 'Nazwa planu',
'planEditor.namePh': 'np. Plan na masę',
'planEditor.desc': 'Opis',
'planEditor.descPh': 'Krótki opis…',
'planEditor.durationDays': 'Czas trwania (dni)',
'planEditor.durationPh': 'Wpisz liczbę dni',
'planEditor.nutritionCalculated': 'Wartości odżywcze (wyliczone)',
'planEditor.nut.calories': 'Kalorie',
'planEditor.nut.protein': 'Białko',
'planEditor.nut.carbs': 'Węglowodany',
'planEditor.nut.fats': 'Tłuszcze',
'planEditor.category': 'Kategoria',
'planEditor.assignDishes': 'Przypisz dania',
'planEditor.duplicate': 'Duplikuj plan',
'planEditor.delete': 'Usuń plan',
'planEditor.copySuffix': '(Kopia)',

// Alerts
'planEditor.alert.missingName.title': 'Brak nazwy',
'planEditor.alert.missingName.msg': 'Wpisz nazwę planu.',
'planEditor.alert.missingDesc.title': 'Brak opisu',
'planEditor.alert.missingDesc.msg': 'Wpisz opis planu.',
'planEditor.alert.missingDuration.title': 'Brak czasu trwania',
'planEditor.alert.missingDuration.msg': 'Wpisz liczbę dni.',
'planEditor.alert.invalidDuration.title': 'Nieprawidłowy czas trwania',
'planEditor.alert.invalidDuration.msg': 'Czas trwania musi być liczbą od 1 do 14 dni.',
'planEditor.alert.noDishes.title': 'Brak przypisanych dań',
'planEditor.alert.noDishes.msg': 'Przypisz co najmniej jedno danie.',
'planEditor.alert.delete.title': 'Usuń plan',
'planEditor.alert.delete.msg': 'Czy na pewno chcesz usunąć ten plan?',
'planEditor.alert.permission.title': 'Wymagane uprawnienia',
'planEditor.alert.permission.msg': 'Dostęp do aparatu jest wymagany.',

// Diet detail
'dietDetail.notFound': 'Nie znaleziono planu diety',
'dietDetail.duration': 'Czas trwania',
'dietDetail.calories': 'Kalorie',
'dietDetail.startPlan': 'Rozpocznij ten plan',
'dietDetail.keyBenefits': 'Najważniejsze korzyści',

'dietDetail.benefit1': 'Zbilansowany rozkład makroskładników',
'dietDetail.benefit2': 'Prosta struktura posiłków',
'dietDetail.benefit3': 'Wspiera utrzymanie zdrowej masy ciała',
'dietDetail.benefit4': 'Różnorodne, pełnowartościowe produkty',
'dietDetail.benefit5': 'Elastyczne godziny posiłków',

'login.terms': 'Rejestrując się, akceptujesz Regulamin oraz Politykę prywatności.',

// Dish editor
'dishEditor.titleAdd': 'Dodaj danie',
'dishEditor.titleEdit': 'Edytuj danie',
'dishEditor.section.image': 'Zdjęcie dania',
'dishEditor.section.basic': 'Podstawowe informacje',
'dishEditor.section.ingredients': 'Składniki',
'dishEditor.section.instructions': 'Instrukcje',
'dishEditor.section.nutrition': 'Wartości odżywcze (wyliczone)',

'dishEditor.addImage': 'Dodaj zdjęcie',
'dishEditor.changeImage': 'Zmień zdjęcie',

'dishEditor.nameLabel': 'Nazwa dania',
'dishEditor.namePh': 'np. Kurczak z ryżem',
'dishEditor.prepTimeLabel': 'Czas przygotowania (minuty)',
'dishEditor.noIngredients': 'Brak składników — dodaj pierwszy składnik',

'dishEditor.instructionsPh': 'Opis przygotowania…',

'dishEditor.ingredient.product': 'Produkt',
'dishEditor.ingredient.amount': 'Ilość (g)',

'dishEditor.nut.calories': 'Kalorie',

'dishEditor.alert.permission.title': 'Wymagane uprawnienia',
'dishEditor.alert.permission.msg': 'Dostęp do aparatu jest wymagany.',

'dishEditor.alert.missingName.title': 'Brak nazwy',
'dishEditor.alert.missingName.msg': 'Wpisz nazwę dania.',

'dishEditor.imageSource.title': 'Dodaj zdjęcie',
'dishEditor.imageSource.msg': 'Wybierz źródło:',
'dishEditor.imageSource.camera': 'Aparat',
'dishEditor.imageSource.gallery': 'Galeria',

'login.forgot.title': 'Ups… jeszcze nie teraz ',
'login.forgot.msg':
  'Przywracanie hasła jest w planach, ale jeszcze nie działa.\n\n' +
  'Na razie polecamy zapisać hasło w notatniku albo menedżerze haseł.\n' +
  '(Tak, wiemy — wersja developerska )',

'common.ok': 'OK',

'settings.theme': 'Motyw',
'settings.theme.light': 'Jasny',
'settings.theme.dark': 'Ciemny',
'settings.wip.title': 'Wkrótce',
'settings.wip.msg': '"{{feature}}" jest w przygotowaniu.',

// Dish editor - extra (validation / empty states)
'dishEditor.noProducts': 'Brak produktów — pobierz produkty z API i spróbuj ponownie.',

'dishEditor.alert.invalidPrepTime.title': 'Nieprawidłowy czas',
'dishEditor.alert.invalidPrepTime.msg': 'Podaj poprawny czas przygotowania (minuty).',

'dishEditor.alert.noIngredients.title': 'Brak składników',
'dishEditor.alert.noIngredients.msg': 'Dodaj przynajmniej jeden składnik.',

'dishEditor.alert.invalidIngredient.title': 'Nieprawidłowy składnik',
'dishEditor.alert.invalidIngredient.msg': 'Wybierz produkt dla każdego składnika.',

'dishEditor.alert.invalidIngredientAmount.title': 'Nieprawidłowa ilość',
'dishEditor.alert.invalidIngredientAmount.msg': 'Ilość musi być liczbą większą od 0.',

'dishEditor.alert.missingInstructions.title': 'Brak instrukcji',
'dishEditor.alert.missingInstructions.msg': 'Wpisz instrukcje przygotowania.',


};

const en: Dict = {
  // BottomNav
  'nav.home': 'Home',
  'nav.plans': 'Plans',
  'nav.products': 'Products',
  'nav.schedule': 'Schedule',
  'nav.profile': 'Profile',

  // Login
  'login.tagline': 'Your personal diet companion',
  'login.tab.login': 'Login',
  'login.tab.signup': 'Sign Up',
  'login.name.placeholder': 'Full Name',
  'login.email.placeholder': 'Email',
  'login.password.placeholder': 'Password',
  'login.forgot': 'Forgot password?',
  'login.wait': 'Please wait…',
  'login.create': 'Create Account',

  // Login errors
  'err.nameShort': 'Name is too short',
  'err.badEmail': 'Invalid email address',
  'err.passShort': 'Password must be at least 6 characters',
  'err.generic': 'Something went wrong',

  // Main
  'main.welcomeBack': 'Welcome back,',
  'main.kcalToday': 'kcal today',
  'main.target': 'target',
  'main.progress': 'progress',
  'main.quickActions': 'Quick Actions',
  'main.action.dietPlans': 'Diet Plans',
  'main.action.addDish': 'Add Dish',
  'main.action.products': 'Products',
  'main.action.schedule': 'Schedule',
  'main.todaysMeals': "Today's Meals",
  'main.viewAll': 'View All',
  'main.noMealsToday': 'No meals scheduled for today',
  'main.scheduleMeals': 'Schedule Meals',
  'main.unknownDish': 'Unknown Dish',

  // Settings
  'settings.profile': 'Profile',
  'settings.personalInfo': 'Personal Information',
  'settings.healthGoals': 'Health Goals',
  'settings.preferences': 'Preferences',
  'settings.notifications': 'Notifications',
  'settings.enabled': 'Enabled',
  'settings.dailyTarget': 'Daily Calorie Target',
  'settings.account': 'Account',
  'settings.privacy': 'Privacy & Security',
  'settings.help': 'Help & Support',
  'settings.language': 'Language',
  'settings.logout': 'Logout',
  'settings.daysActive': 'Days Active',
  'settings.mealsLogged': 'Meals Logged',
  'settings.progress': 'Progress',

  // Meal types
  'meal.breakfast': 'breakfast',
  'meal.lunch': 'lunch',
  'meal.dinner': 'dinner',
  'meal.snack': 'snack',

  // Schedule
'schedule.title': 'Schedule',
'schedule.mealsFor': 'Meals for {{date}}',
'schedule.noMealsThisDay': 'No meals scheduled for this day',
'schedule.addMealTitle': 'Add Meal',
'schedule.addModeLabel': 'What to add',
'schedule.addModeDish': 'Single dish',
'schedule.addModePlan': 'Diet plan',
'schedule.dishLabel': 'Dish',
'schedule.selectDish': 'Select dish',
'schedule.planLabel': 'Diet plan',
'schedule.selectPlan': 'Select plan',
'schedule.mealTypeLabel': 'Meal Type',
'schedule.selectType': 'Select type',
'schedule.timeLabel': 'Time',
'schedule.selectTime': 'Select time',
'schedule.addMealButton': 'Add Meal',
'schedule.editTimeTitle': 'Change time',
'schedule.editTime': 'Change',
'schedule.alert.calendarPermission.title': 'No permission',
'schedule.alert.calendarPermission.msg': 'Allow the app to access your calendar.',
'schedule.alert.noGoogleCalendar.title': 'No Google calendar',
'schedule.alert.noGoogleCalendar.msg': 'No writable Google calendar was found on this device.',
'schedule.calendarPicker.title': 'Choose calendar',
'schedule.calendarPicker.label': 'Google calendar',
'schedule.googleCalendar.label': 'Google calendar',
'schedule.googleCalendar.none': 'not selected',
'schedule.googleCalendar.select': 'Select',
'schedule.googleCalendar.change': 'Change',
'schedule.googleCalendar.eventsTitle': 'Events from Google',
'schedule.googleCalendar.loading': 'Loading…',
'schedule.googleCalendar.noEvents': 'No events',
'schedule.googleCalendar.untitled': 'Untitled',
'schedule.alert.calendarDelete.title': 'Delete failed',
'schedule.alert.calendarDelete.msg': 'There was a problem deleting the event.',
'schedule.sync.okTitle': 'Synchronized',
'schedule.sync.okMsg': 'Synchronized with calendar.',
'schedule.sync.errorTitle': 'Error',
'schedule.sync.errorMsg': 'Could not synchronize.',
'schedule.sync.button': 'Synchronize with calendar',
'schedule.sync.inProgress': 'Synchronizing…',
'schedule.alert.missingFields.title': 'Missing data',
'schedule.alert.missingFields.msg': 'Select meal type and time.',
'schedule.alert.missingDish.msg': 'Select a dish.',
'schedule.alert.missingPlan.msg': 'Select a diet plan.',
'schedule.alert.emptyPlan.title': 'Empty plan',
'schedule.alert.emptyPlan.msg': 'This plan has no dishes assigned.',
'schedule.alert.invalidDuration.title': 'Invalid duration',
'schedule.alert.invalidDuration.msg': 'Could not read day count from the plan.',
'schedule.alert.invalidDate.title': 'Invalid date',
'schedule.alert.invalidDate.msg': 'Could not read the selected date.',

// Common
'common.add': 'Add',
'common.cancel': 'Cancel',

// Weekdays (short)
'weekday.sun': 'Sun',
'weekday.mon': 'Mon',
'weekday.tue': 'Tue',
'weekday.wed': 'Wed',
'weekday.thu': 'Thu',
'weekday.fri': 'Fri',
'weekday.sat': 'Sat',

// Months
'month.january': 'January',
'month.february': 'February',
'month.march': 'March',
'month.april': 'April',
'month.may': 'May',
'month.june': 'June',
'month.july': 'July',
'month.august': 'August',
'month.september': 'September',
'month.october': 'October',
'month.november': 'November',
'month.december': 'December',

// Products
'products.title': 'Products Base',
'products.searchPlaceholder': 'Search products…',
'products.found': '{{count}} products found',
'products.noneFound': 'No products found',
'products.kcal': 'kcal',

// Product categories
'productCat.all': 'All',
'productCat.protein': 'Protein',
'productCat.grains': 'Grains',
'productCat.vegetables': 'Vegetables',
'productCat.fats': 'Fats',
'productCat.dairy': 'Dairy',

// Macros
'macro.protein': 'Protein',
'macro.carbs': 'Carbs',
'macro.fats': 'Fats',

// Diet plans
'dietPlans.title': 'Diet Plans',
'dietPlans.searchPlaceholder': 'Search diet plans…',
'dietPlans.noneFound': 'No diet plans found',

// Diet categories (UI labels)
'dietCat.all': 'All',
'dietCat.balanced': 'Balanced',
'dietCat.weightLoss': 'Weight Loss',
'dietCat.vegan': 'Vegan',
'dietCat.keto': 'Keto',

// Common
'common.kcal': 'kcal',
'common.days': 'days',

// Common (if missing)
'common.save': 'Save',
'common.delete': 'Delete',

// Diet plan editor
'planEditor.titleAdd': 'Add Diet Plan',
'planEditor.titleEdit': 'Edit Diet Plan',
'planEditor.image': 'Plan Image',
'planEditor.addImage': 'Add Image',
'planEditor.name': 'Plan Name',
'planEditor.namePh': 'e.g. Lean Muscle Plan',
'planEditor.desc': 'Description',
'planEditor.descPh': 'Short description…',
'planEditor.durationDays': 'Duration (days)',
'planEditor.durationPh': 'Enter number of days',
'planEditor.nutritionCalculated': 'Nutrition (calculated)',
'planEditor.nut.calories': 'Calories',
'planEditor.nut.protein': 'Protein',
'planEditor.nut.carbs': 'Carbs',
'planEditor.nut.fats': 'Fats',
'planEditor.category': 'Category',
'planEditor.assignDishes': 'Assign Dishes',
'planEditor.duplicate': 'Duplicate Plan',
'planEditor.delete': 'Delete Plan',
'planEditor.copySuffix': '(Copy)',

// Alerts
'planEditor.alert.missingName.title': 'Missing Name',
'planEditor.alert.missingName.msg': 'Please enter a plan name.',
'planEditor.alert.missingDesc.title': 'Missing Description',
'planEditor.alert.missingDesc.msg': 'Please enter a plan description.',
'planEditor.alert.missingDuration.title': 'Missing Duration',
'planEditor.alert.missingDuration.msg': 'Please enter number of days.',
'planEditor.alert.invalidDuration.title': 'Invalid Duration',
'planEditor.alert.invalidDuration.msg': 'Duration must be between 1 and 14 days.',
'planEditor.alert.noDishes.title': 'No Dishes Assigned',
'planEditor.alert.noDishes.msg': 'Please assign at least one dish.',
'planEditor.alert.delete.title': 'Delete Plan',
'planEditor.alert.delete.msg': 'Are you sure you want to delete this plan?',
'planEditor.alert.permission.title': 'Permission required',
'planEditor.alert.permission.msg': 'Camera access is needed.',

// Diet detail
'dietDetail.notFound': 'Diet plan not found',
'dietDetail.duration': 'Duration',
'dietDetail.calories': 'Calories',
'dietDetail.startPlan': 'Start This Plan',
'dietDetail.keyBenefits': 'Key Benefits',

'dietDetail.benefit1': 'Balanced macronutrient distribution',
'dietDetail.benefit2': 'Easy to follow meal structure',
'dietDetail.benefit3': 'Supports sustainable weight management',
'dietDetail.benefit4': 'Includes variety of whole foods',
'dietDetail.benefit5': 'Flexible meal timing options',

'login.terms': 'By signing up, you agree to our Terms & Privacy Policy.',



// Dish editor
'dishEditor.titleAdd': 'Add Dish',
'dishEditor.titleEdit': 'Edit Dish',
'dishEditor.section.image': 'Dish Image',
'dishEditor.section.basic': 'Basic Information',
'dishEditor.section.ingredients': 'Ingredients',
'dishEditor.section.instructions': 'Instructions',
'dishEditor.section.nutrition': 'Nutrition (calculated)',

'dishEditor.addImage': 'Add Image',
'dishEditor.changeImage': 'Change Image',

'dishEditor.nameLabel': 'Dish Name',
'dishEditor.namePh': 'e.g., Grilled Chicken Bowl',
'dishEditor.prepTimeLabel': 'Preparation Time (minutes)',
'dishEditor.noIngredients': 'No ingredients yet — add the first one',

'dishEditor.instructionsPh': 'Preparation steps…',

'dishEditor.ingredient.product': 'Product',
'dishEditor.ingredient.amount': 'Amount (g)',

'dishEditor.nut.calories': 'Calories',

'dishEditor.alert.permission.title': 'Permission required',
'dishEditor.alert.permission.msg': 'Camera access is needed.',

'dishEditor.alert.missingName.title': 'Missing Name',
'dishEditor.alert.missingName.msg': 'Please enter a dish name.',

'dishEditor.imageSource.title': 'Add Image',
'dishEditor.imageSource.msg': 'Choose source:',
'dishEditor.imageSource.camera': 'Camera',
'dishEditor.imageSource.gallery': 'Gallery',

'login.forgot.title': 'Oops… not yet ',
'login.forgot.msg':
  'Password recovery is planned, but not available yet.\n\n' +
  'For now, we recommend saving your password in a notes app or password manager.\n' +
  '(Yes, we know — dev version )',

'common.ok': 'OK',

'settings.theme': 'Theme',
'settings.theme.light': 'Light',
'settings.theme.dark': 'Dark',
'settings.wip.title': 'Coming soon',
'settings.wip.msg': '"{{feature}}" is a work in progress.',
// Dish editor - extra (validation / empty states)
'dishEditor.noProducts': 'No products available — fetch products from the API and try again.',

'dishEditor.alert.invalidPrepTime.title': 'Invalid time',
'dishEditor.alert.invalidPrepTime.msg': 'Enter a valid preparation time (minutes).',

'dishEditor.alert.noIngredients.title': 'No ingredients',
'dishEditor.alert.noIngredients.msg': 'Add at least one ingredient.',

'dishEditor.alert.invalidIngredient.title': 'Invalid ingredient',
'dishEditor.alert.invalidIngredient.msg': 'Select a product for each ingredient.',

'dishEditor.alert.invalidIngredientAmount.title': 'Invalid amount',
'dishEditor.alert.invalidIngredientAmount.msg': 'Amount must be a number greater than 0.',

'dishEditor.alert.missingInstructions.title': 'Missing instructions',
'dishEditor.alert.missingInstructions.msg': 'Enter preparation instructions.',

};

const dictionaries: Record<Language, Dict> = { pl, en };

export function translate(lang: Language, key: string, params?: Record<string, string | number>) {
  const dict = dictionaries[lang] ?? dictionaries.en;
  const fallback = dictionaries.en[key] ?? key;
  const template = dict[key] ?? fallback;

  if (!params) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (_, p1) => String(params[p1] ?? `{{${p1}}}`));
}

export function useT() {
  const { language } = useApp();
  return (key: string, params?: Record<string, string | number>) => translate(language, key, params);
}
