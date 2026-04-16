/**
 * Vietnamese (vi-VN) string catalogue
 *
 * Organised by screen/feature. All user-facing text for the 16 auth-related
 * screens extracted from screen-specs.md.
 */

const vi = {
  // ---------------------------------------------------------------------------
  // Common / shared
  // ---------------------------------------------------------------------------
  common: {
    next: 'Tiep tuc',
    back: 'Quay lai',
    cancel: 'Huy',
    confirm: 'Xac nhan',
    save: 'Luu',
    done: 'Xong',
    retry: 'Thu lai',
    loading: 'Dang tai...',
    processing: 'Dang xu ly...',
    or: 'hoac',
    required: 'Bat buoc',
    optional: 'Tuy chon',
    understood: 'Da hieu',
    close: 'Dong',
    delete: 'Xoa',
    edit: 'Chinh sua',
    seeAll: 'Xem tat ca',
    add: 'Them',
    search: 'Tim kiem',
  },

  // ---------------------------------------------------------------------------
  // Screen 1 — Splash
  // ---------------------------------------------------------------------------
  splash: {
    tagline: 'Dau tu thong minh hon',
  },

  // ---------------------------------------------------------------------------
  // Screen 2 — Onboarding (3 steps)
  // ---------------------------------------------------------------------------
  onboarding: {
    step1: {
      question: 'Ban dang o dau?',
      subtitle: 'Chung toi se ca nhan hoa trai nghiem cho ban',
      optionVN: 'Viet Nam',
      optionKR: 'Han Quoc',
      optionOther: 'Quoc gia khac',
    },
    step2: {
      question: 'Ban quan tam thi truong nao?',
      subtitle: 'Co the chon nhieu',
      optionVN: 'Thi truong Viet Nam (HOSE / HNX)',
      optionKR: 'Thi truong Han Quoc (KOSPI / KOSDAQ)',
      optionUS: 'Thi truong My (NYSE / NASDAQ)',
      optionAll: 'Tat ca thi truong',
    },
    step3: {
      question: 'Ban ten la gi?',
      subtitle: 'Chung toi se goi ban bang ten nay',
      placeholder: 'Vi du: Minh, Hyun, Alex',
      label: 'Ten cua ban',
      hint: 'Khong can ten that — biet danh cung duoc nhe',
      cta: 'Bat dau kham pha',
      errorInvalidName: 'Vui long nhap ten hop le',
    },
  },

  // ---------------------------------------------------------------------------
  // Screen 3 — Home Dashboard
  // ---------------------------------------------------------------------------
  home: {
    greetingMorning: 'Chao buoi sang',
    greetingAfternoon: 'Chao buoi chieu',
    greetingEvening: 'Chao buoi toi',
    portfolioLabel: 'Tong danh muc',
    todayLabel: 'hom nay',
    watching: 'Dang theo doi',
    stockUnit: 'CP',
    marketToday: 'Thi truong hom nay',
    trending: 'Dang noi bat',
    watchlist: 'Danh sach theo doi',
    addWatchlist: 'Them',
    emptyWatchlistTitle: 'Chua theo doi co phieu nao',
    emptyWatchlistSubtitle: 'Them co phieu de theo doi bien dong gia',
    emptyWatchlistCta: 'Kham pha ngay',
    emptyPortfolioSubtitle: 'Bat dau theo doi danh muc cua ban',
    viewersWatching: 'nguoi dang xem',
    cannotLoad: 'Khong the tai',
    errorGeneric: 'Dang gap su co, thu lai sau',
    updatedAt: 'Cap nhat luc',
    watchlistLimit: 'Da dat gioi han 100 CP',
    disclaimer: 'Tinh nang nay chi mang tinh chat giao duc va mo phong.',
  },

  // ---------------------------------------------------------------------------
  // Screen 4 — Discover
  // ---------------------------------------------------------------------------
  discover: {
    title: 'Kham pha',
    searchPlaceholder: 'Tim kiem co phieu, ETF...',
    filterAll: 'Tat ca',
    filterVN: 'Viet Nam',
    filterKR: 'Han Quoc',
    filterUS: 'My',
    topGainers: 'Tang manh nhat',
    topLosers: 'Giam manh nhat',
    mostViewed: 'Xem nhieu nhat',
  },

  // ---------------------------------------------------------------------------
  // Screen 5 — Stock Detail
  // ---------------------------------------------------------------------------
  stockDetail: {
    buy: 'Mua',
    sell: 'Ban',
    follow: 'Theo doi',
    following: 'Dang theo doi',
    overview: 'Tong quan',
    chart: 'Bieu do',
    news: 'Tin tuc',
    community: 'Cong dong',
    highToday: 'Cao nhat',
    lowToday: 'Thap nhat',
    volume: 'Khoi luong',
    marketCap: 'Von hoa',
    pe: 'P/E',
    eps: 'EPS',
  },

  // ---------------------------------------------------------------------------
  // Screen 6 — Portfolio
  // ---------------------------------------------------------------------------
  portfolio: {
    title: 'Danh muc',
    totalValue: 'Tong gia tri',
    pnl: 'Lai/Lo',
    holdings: 'Co phieu so huu',
    allocation: 'Phan bo',
    noHoldings: 'Chua co co phieu nao trong danh muc',
    startTrading: 'Bat dau giao dich',
  },

  // ---------------------------------------------------------------------------
  // Screen 7 — Markets
  // ---------------------------------------------------------------------------
  markets: {
    title: 'Thi truong',
    tabVN: 'VN',
    tabKR: 'KR',
    tabGlobal: 'Global',
    indices: 'Chi so',
    topMovers: 'Bien dong lon',
    sectors: 'Nganh',
  },

  // ---------------------------------------------------------------------------
  // Screen 8 — Price Alert
  // ---------------------------------------------------------------------------
  priceAlert: {
    title: 'Canh bao gia',
    createAlert: 'Tao canh bao',
    priceAbove: 'Gia tren',
    priceBelow: 'Gia duoi',
    percentChange: 'Bien dong %',
    alertActive: 'Dang hoat dong',
    alertTriggered: 'Da kich hoat',
    deleteAlert: 'Xoa canh bao',
    noAlerts: 'Chua co canh bao nao',
    noAlertsSubtitle: 'Tao canh bao de nhan thong bao khi gia thay doi',
  },

  // ---------------------------------------------------------------------------
  // Screen 9 — Profile / Settings
  // ---------------------------------------------------------------------------
  profile: {
    title: 'Tai khoan',
    editProfile: 'Chinh sua ho so',
    settings: 'Cai dat',
    language: 'Ngon ngu',
    notifications: 'Thong bao',
    biometric: 'Sinh trac hoc',
    security: 'Bao mat',
    helpCenter: 'Trung tam ho tro',
    about: 'Gioi thieu',
    logout: 'Dang xuat',
    logoutConfirm: 'Ban co chac muon dang xuat?',
    version: 'Phien ban',
    deleteAccount: 'Xoa tai khoan',
    deleteAccountWarning: 'Hanh dong nay khong the hoan tac.',
  },

  // ---------------------------------------------------------------------------
  // Screen 20 — Registration
  // ---------------------------------------------------------------------------
  registration: {
    progressConsent: 'Consent',
    progressMarket: 'Market',
    progressAccount: 'Account',
    progressVerify: 'Verify',

    // Consent section
    consentTitle: 'Dieu khoan su dung',
    consentSubtitle: 'Vui long doc va dong y cac dieu khoan truoc khi tiep tuc',
    tosCheckbox: 'Toi dong y voi Dieu khoan dich vu',
    tosLink: 'Dieu khoan dich vu',
    privacyCheckbox: 'Toi dong y voi Chinh sach bao mat va thu thap du lieu',
    privacyLink: 'Chinh sach bao mat',
    marketingCheckbox: 'Toi dong y nhan thong bao tiep thi va khuyen mai tu Paave',

    // DOB section
    dobLabel: 'Ngay sinh',
    dobSubLabel: 'Ban phai tu 16 tuoi tro len de su dung Paave',
    dobPlaceholder: 'DD / MM / YYYY',
    ageLearnMode: 'Ban se su dung Paave o che do hoc tap (LEARN_MODE)',
    ageParental: 'Can su dong y cua phu huynh. Tinh nang nay se co trong phien ban toi.',
    ageBlocked: 'Paave yeu cau nguoi dung phai tu 13 tuoi tro len.',

    // Email + Password section
    emailLabel: 'Email',
    emailPlaceholder: 'example@email.com',
    emailInvalid: 'Email khong hop le',
    emailTaken: 'Email da duoc su dung',

    passwordLabel: 'Mat khau',
    passwordPlaceholder: '8+ ky tu, chu hoa, so, ky tu dac biet',
    passwordConfirmLabel: 'Xac nhan mat khau',
    passwordMismatch: 'Mat khau khong khop',
    passwordRuleUpper: '1 chu hoa',
    passwordRuleLower: '1 chu thuong',
    passwordRuleDigit: '1 so',
    passwordRuleSpecial: '1 ky tu dac biet (!@#$%^&*)',

    // CTA
    ctaCreateAccount: 'Tao tai khoan',

    // Errors
    cannotLoadTos: 'Khong the tai dieu khoan. Kiem tra ket noi.',
    cannotCreateAccount: 'Khong the tao tai khoan. Thu lai.',
  },

  // ---------------------------------------------------------------------------
  // Screen 21 — Email Verification (OTP)
  // ---------------------------------------------------------------------------
  emailVerification: {
    title: 'Xac nhan email',
    subtitle: 'Chung toi da gui ma xac nhan den',
    timerPrefix: 'Ma het han sau ',
    resend: 'Gui lai ma',
    resendCooldown: 'trong',
    resendCooldownUnit: 's',
    resendSuccess: 'Ma moi da duoc gui',
    spamHint: 'Khong nhan duoc? Kiem tra muc Spam hoac Quang cao.',
    success: 'Xac nhan thanh cong!',
    errorWrongCode: 'Ma khong dung. Con',
    errorWrongCodeSuffix: 'lan thu.',
    errorLocked: 'Qua nhieu lan thu. Vui long thu lai sau 15 phut.',
    errorExpired: 'Ma da het han. Gui lai ma moi.',
    errorNetwork: 'Khong the xac nhan. Kiem tra ket noi.',
    exitConfirm: 'Thoat xac nhan?',
    resendRateLimit: 'Vui long cho',
    resendRateLimitSuffix: 's truoc khi gui lai',
  },

  // ---------------------------------------------------------------------------
  // Screen 22 — Biometric Enrollment
  // ---------------------------------------------------------------------------
  biometricEnrollment: {
    titleFaceId: 'Dang nhap bang Face ID?',
    titleFingerprint: 'Dang nhap bang van tay?',
    subtitle: 'Dang nhap nhanh hon va an toan hon cho nhung lan su dung tiep theo',
    ctaEnable: 'Bat dau su dung',
    ctaLater: 'De sau',
    successToast: 'Da bat dau!',
    errorGeneric: 'Khong the thiet lap. Thu lai trong Cai dat.',
    errorNotEnrolled: 'Chua cai dat sinh trac hoc tren thiet bi. Vui long cai dat trong Cai dat he thong.',
    errorPermission: 'Quyen truy cap sinh trac hoc bi tu choi. Kiem tra Cai dat > Quyen ung dung.',
  },

  // ---------------------------------------------------------------------------
  // Screen 35 — Social Login
  // ---------------------------------------------------------------------------
  socialLogin: {
    dividerText: 'hoac',
    continueWithGoogle: 'Tiep tuc voi Google',
    continueWithApple: 'Tiep tuc voi Apple',
    linkTitle: 'Tai khoan voi email nay da ton tai',
    linkBody: 'da duoc dang ky. Ban muon lien ket voi',
    linkCta: 'Lien ket',
    linkCancel: 'Huy',
    linkError: 'Lien ket khong thanh cong',
    errorProvider: 'Khong the ket noi voi',
    errorProviderSuffix: '. Vui long thu lai.',
    errorGooglePlay: 'Can cai dat Google Play Services.',
    errorBothProviders: 'Khong the dang nhap bang mang xa hoi. Dung email/mat khau.',
    errorNetwork: 'Khong co ket noi mang. Vui long thu lai.',
    errorProviderUnavailable: 'Dich vu tam thoi khong kha dung.',
  },

  // ---------------------------------------------------------------------------
  // Screen 36 — 2FA OTP Verification
  // ---------------------------------------------------------------------------
  twoFactor: {
    title: 'Xac thuc hai buoc',
    subtitle: 'Nhap ma OTP da gui den email cua ban',
    cancelLogin: 'Huy dang nhap',
    success: 'Xac thuc thanh cong!',
    errorWrongCode: 'Ma khong dung. Con',
    errorWrongCodeSuffix: 'lan thu.',
    errorLocked: 'Qua nhieu lan thu. Vui long thu lai sau 15 phut.',
    errorExpired: 'Phien het han. Dang nhap lai.',
    errorNetwork: 'Khong the xac nhan. Kiem tra ket noi.',
    resendError: 'Khong the gui ma. Thu lai sau.',
  },

  // ---------------------------------------------------------------------------
  // Login screen (Welcome)
  // ---------------------------------------------------------------------------
  login: {
    welcome: 'Chao mung den Paave',
    subtitle: 'Dau tu thong minh hon',
    ctaRegister: 'Tao tai khoan',
    ctaLogin: 'Dang nhap',
    emailLabel: 'Email hoac ten dang nhap',
    passwordLabel: 'Mat khau',
    forgotPassword: 'Quen mat khau?',
    loginButton: 'Dang nhap',
    loginError: 'Email hoac mat khau khong dung',
    loginLocked: 'Tai khoan bi khoa. Thu lai sau 15 phut.',
  },

  // ---------------------------------------------------------------------------
  // Password Reset
  // ---------------------------------------------------------------------------
  passwordReset: {
    title: 'Dat lai mat khau',
    subtitle: 'Nhap email da dang ky de nhan ma OTP',
    emailPlaceholder: 'Email da dang ky',
    sendCode: 'Gui ma xac nhan',
    codeSent: 'Ma xac nhan da duoc gui',
    newPasswordLabel: 'Mat khau moi',
    newPasswordPlaceholder: '8+ ky tu, chu hoa, so, ky tu dac biet',
    confirmPasswordLabel: 'Xac nhan mat khau moi',
    resetButton: 'Dat lai mat khau',
    success: 'Mat khau da duoc dat lai thanh cong',
    errorSamePassword: 'Mat khau moi khong duoc trung voi mat khau cu.',
    errorExpiredToken: 'Lien ket het han. Vui long yeu cau lai.',
  },

  // ---------------------------------------------------------------------------
  // Paper Trading Order (Screen 23)
  // ---------------------------------------------------------------------------
  paperTrading: {
    virtualFundsBanner: 'Tien ao / Virtual Funds',
    orderTitle: 'Dat lenh',
    buy: 'Mua',
    sell: 'Ban',
    orderTypeLabel: 'Loai lenh',
    orderTypeMarket: 'Thi truong',
    orderTypeLimit: 'Gioi han',
    quantityLabel: 'So luong (CP)',
    quantityMax: 'Toi da',
    limitPriceLabel: 'Gia gioi han',
    limitBuyHint: 'Lenh khop khi gia <= gia gioi han',
    limitSellHint: 'Lenh khop khi gia >= gia gioi han',
    availableBalance: 'So du kha dung',
    confirmOrder: 'Xac nhan lenh',
    insufficient: 'So du khong du',
  },

  // ---------------------------------------------------------------------------
  // Notifications (Screens 18-19)
  // ---------------------------------------------------------------------------
  notifications: {
    title: 'Thong bao',
    empty: 'Chua co thong bao nao',
    markAllRead: 'Danh dau tat ca da doc',
    settingsTitle: 'Cai dat thong bao',
    priceAlerts: 'Canh bao gia',
    tradeUpdates: 'Cap nhat giao dich',
    communityActivity: 'Hoat dong cong dong',
    systemNotices: 'Thong bao he thong',
  },

  // ---------------------------------------------------------------------------
  // General errors & toasts
  // ---------------------------------------------------------------------------
  errors: {
    networkError: 'Khong the ket noi. Vui long kiem tra mang.',
    serverError: 'Loi he thong. Vui long thu lai sau.',
    unknownError: 'Loi khong xac dinh.',
    sessionExpired: 'Phien dang nhap het han. Vui long dang nhap lai.',
    rateLimit: 'Ban dang thao tac qua nhanh. Vui long cho.',
  },

  // ---------------------------------------------------------------------------
  // Bottom Tab Navigation
  // ---------------------------------------------------------------------------
  tabs: {
    home: 'Trang chu',
    discover: 'Kham pha',
    portfolio: 'Danh muc',
    markets: 'Thi truong',
    profile: 'Tai khoan',
  },
} as const;

export type Translations = typeof vi;
export default vi;
