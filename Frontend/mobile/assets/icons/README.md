# Mobile App Icons

## Available Icons

### App Icons
- `icon.png` - Main app icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon
- `splash-icon.png` - Splash screen icon
- `favicon.png` - Web favicon

### Feature Icons
- `logo.png` - CityVetCare logo (primary)
- `logo1.png` - CityVetCare logo (alternate)
- `vet_logo.png` - Veterinary logo
- `adopt_pet_icon.png` - Pet adoption icon
- `reading_materials_icon.png` - Reading materials icon
- `register_pet_icon.png` - Pet registration icon
- `report_icon.png` - Report incident icon
- `qr_icon.png` - QR code icon

## Usage

### Using Local Icons
```javascript
<Image source={require('../../assets/icons/logo.png')} />
```

### Using Vector Icons
```javascript
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

<Ionicons name="heart" size={24} color="red" />
<MaterialIcons name="pets" size={24} color="orange" />
<FontAwesome name="home" size={24} color="blue" />
<MaterialCommunityIcons name="dog" size={24} color="brown" />
```

## Icon Families Available

All icons from these families are available via @expo/vector-icons:
- **Ionicons** - Modern iOS-style icons
- **MaterialIcons** - Google Material Design icons
- **MaterialCommunityIcons** - Material Design Community icons
- **FontAwesome** - Font Awesome 5 Free icons
- **FontAwesome5** - Font Awesome 5 Pro icons
- **AntDesign** - Ant Design icons
- **Entypo** - Entypo icons
- **EvilIcons** - Evil Icons
- **Feather** - Feather icons
- **Foundation** - Zurb Foundation icons
- **Octicons** - GitHub Octicons
- **SimpleLineIcons** - Simple Line Icons
- **Zocial** - Social media icons

Browse all icons at: https://icons.expo.fyi/
