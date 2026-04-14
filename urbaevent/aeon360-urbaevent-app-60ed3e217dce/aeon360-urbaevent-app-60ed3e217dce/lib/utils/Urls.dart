class Urls {
  //base url//

  //dev environment
  // static String baseURL = "http://SIB.positif.ma/backend/api";
  // static String imageURL = "http://SIB.positif.ma/backend";

  //  prod environment
  static String baseURL = "https://sbyizudifmqakzxjlndr.supabase.co/rest/v1";
  static String imageURL = "https://sbyizudifmqakzxjlndr.supabase.co/storage/v1";

  //login
  static String login = "/auth/local";

  static String socialLogin = "/auth/social";

  //forgot password
  static String forgotPwd = "/auth/forgot-password";

  static String resetPwd = "/auth/reset-password";

  //register
  static String register = "/auth/local/register";

  //resend OTP
  static String resendOTP = "/users/resendEmailOTP";

  //get user info & role for navigation
  static String authRole =
      "/users/me?populate[role]=true&populate[avatar]=true&populate[businessSector]=true";

  static String userDetails =
      "/users/me?populate[role]=true&populate[avatar]=true&populate[businessSector]=true";

  static String updateProfile = "/users/";

  static String changePwd = "/auth/change-password";

  static String uploadPic = "/upload";

  static String verifyEmailOTP = "/users/verifyEmailOTP";

  static String eventList =
      "/events?filters[enabled]=true&populate[banner]=true&populate[logo]=true&sort=startDate:asc";

  //register for event/conference
  static String registrations = "/registrations";

  //my events
  static String userEventList = "/registrations?filters[user]=";
  static String userEventListFilter =
      "&filters[conference][id][\$null]=true&populate[event][populate]=logo&sort=startDate:asc";

  //conference list
  static String conferencesList = "/conferences?filters[event]=";
  static String conferencesListFilter = "&populate[banner]=true";

  static String conferenceRegistrationList =
      "/conferences?fields[0]=id&filters[registrations][user]=";
  static String conferenceRegistrationListFilter = "&filters[event]=";

  //my schedule list
  static String mySchedule = "/conferences?filters[registrations][user]=";
  static String myScheduleListFilter1 = "&filters[event]=";
  static String myScheduleListFilter2 =
      "&populate[banner]=true&sort[0]=date:asc&sort[1]=startTime:asc";

  //PortalList
  static String portalList = "/registrations?filters[event]=";
  static String portalListFilter1 =
      "&filters[type]=exhibitor&filters[user][id][\$null]=false&filters[confirmed]=true&filters[conference][id][\$null]=true&populate[gate]=true&populate[user][populate]=avatar&populate[user][populate]=businessSector&filters[user][company][\$null]=false";

  //ebadgeList
  static String ebadgesList = "/registrations?filters[user]=";
  static String ebadgesListFilter =
      "&filters[conference][id][\$null]=true&populate[user]=true&populate[event][populate]=logo&sort=id:desc";

  //Download=Ebadge
  static String downloadEbadge = "/registrations/downloadEbadge/";

  //View QR
  static String viewQRCode = "/registrations/getQRCode/";

  //business sector list
  static String businessSector = "/business-sectors?sort=name:asc";

  //qr scan
  static String scans = "/scans";

  static String scanController = "/scans-controllers";

  //contact list
  static String contactList = "/scans?filters[users]=";
  static String contactListFilter1 = "&populate[users][filters][id][\$ne]=";
  static String contactListFilter2 =
      "&populate[users][populate]=avatar&populate[event]=true";

  //contact details
  static String contactDetails = "/users/";
  static String contactDetailsFilter =
      "?&populate[avatar]=true&populate[scans][populate]=event&populate[scans][filters][id]=";

  //add associates
  static String users = "/auth/local/register";

  //get associates
  static String getAssociateList = "/users?sort=id:desc&blocked=false&filters[exhibitor]=";
  static String getAssociateListFilter = "&populate[registrations][filters][event][id]=";

  static String notificationList = "/notifications?sort=id:desc";
  static String notificationReadIndex = "/users/";

  static String deleteUsers = "/users/";

  static String authUserController =
      "/users/me?populate[role]=true&populate[avatar]=true&populate[eventControl][populate]=banner";

  static String gateList = "/gates?filters[event]=";
  static String gateListFilter = "&sort=name:asc";

  static String myScans = "/scans-controllers?filters[controller]=";
  static String myScansFilter =
      "&populate[user][populate]=avatar&populate[event][populate]=banner&populate[gate]=true&sort=id:desc";

  static String deleteAvatar = "/upload/files/";

  static String sendAssociateEmailInvite = "/users/sendCreds/";

  static String sendAppleData = "/apples";

  static String getAppleData = "/apples/";
}
