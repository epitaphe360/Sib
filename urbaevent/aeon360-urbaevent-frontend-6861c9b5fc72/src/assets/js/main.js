$(function () {
    "use strict";

    /*-- Header Sticky
    -----------------------------------*/
    $(window).on('scroll', function (event) {
        var scroll = $(window).scrollTop();
        if (scroll <= 100) {
            $(".header-sticky").removeClass("sticky");
        } else {
            $(".header-sticky").addClass("sticky");
        }
    });

    /*-- Search Js
    -----------------------------------*/
    var $searchWrap = $('.search-wrap');
    var $navSearch = $('.search-btn');
    var $searchClose = $('#search-close');

    $('.search-btn').on('click', function (e) {
        e.preventDefault();
        $searchWrap.animate({ opacity: 'toggle' }, 500);
        $navSearch.add($searchClose).addClass("open");
    });

    $('.search-close').on('click', function (e) {
        e.preventDefault();
        $searchWrap.animate({ opacity: 'toggle' }, 500);
        $navSearch.add($searchClose).removeClass("open");
    });

    function closeSearch() {
        $searchWrap.fadeOut(200);
        $navSearch.add($searchClose).removeClass("open");
    }

    $(document.body).on('click', function (e) {
        closeSearch();
    });

    $(".search-btn, .main-search-input").on('click', function (e) {
        e.stopPropagation();
    });

    $('.meeta-event-accordion-title').click(function (e) {
        e.preventDefault();

        let $this = $(this);

        if ($this.next().hasClass('show')) {
            $this.next().removeClass('show');
            $this.next().slideUp(350);
        } else {
            $this.parent().parent().find('meeta-event-accordion-body').removeClass('show');
            $this.parent().parent().find('meeta-event-accordion-body').slideUp(350);
            $this.next().toggleClass('show');
            $this.next().slideToggle(350);
        }
    });

    $(".meeta-event-accordion-item > .meeta-event-accordion-toggle").on("click", function () {
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            $(this).siblings(".meeta-event-accordion-body").slideUp(200);
        } else {
            $(".meeta-event-accordion-item > .meeta-event-accordion-toggle").removeClass("active");
            $(this).addClass("active");
            $(".meeta-event-accordion-body").slideUp(200);
            $(this).siblings(".meeta-event-accordion-body").slideDown(200);
        }
    });

});

/*-- Menu Script
-----------------------------------*/
var menuSideBar = (function () {
    return {
        init: function () {
            $('.menu-toggle').on('click', function () {
                $('.mobile-menu').addClass('open')
                $('.overlay').addClass('open')
            });
            $('.menu-close').on('click', function () {
                $('.mobile-menu').removeClass('open')
                $('.overlay').removeClass('open')
            });
            $('.overlay').on('click', function () {
                $('.mobile-menu').removeClass('open')
                $('.overlay').removeClass('open')
            });
            var $offCanvasNav = $('.offcanvas-menu'),
                $offCanvasNavSubMenu = $offCanvasNav.find('.sub-menu');
            $offCanvasNavSubMenu.parent().prepend('<span class="mobile-menu-expand"></span>');
            $offCanvasNavSubMenu.slideUp();
            $offCanvasNav.on('click', 'li a, li .mobile-menu-expand, li .menu-title', function (e) {
                var $this = $(this);
                if (($this.parent().attr('class')?.match(/\b(menu-item-has-children|has-children|has-sub-menu)\b/)) && ($this.attr('href') === '#' || $this.hasClass('mobile-menu-expand'))) {
                    e.preventDefault();
                    if ($this.siblings('ul:visible').length) {
                        $this.parent('li').removeClass('active-expand');
                        $this.siblings('ul').slideUp();
                    } else {
                        $this.parent('li').addClass('active-expand');
                        $this.closest('li').siblings('li').find('ul:visible').slideUp();
                        $this.closest('li').siblings('li').removeClass('active-expand');
                        $this.siblings('ul').slideDown();
                    }
                }
            });
            $(".sub-menu").parent("li").addClass("menu-item-has-children");
        }
    }
})(menuSideBar || {});


/*-- Countdown
-----------------------------------*/
function makeTimer($endDate, $this, $format) {
    var today = new Date();
    var BigDay = new Date($endDate),
        msPerDay = 24 * 60 * 60 * 1000,
        timeLeft = (BigDay.getTime() - today.getTime()),
        e_daysLeft = timeLeft / msPerDay,
        daysLeft = Math.floor(e_daysLeft),
        e_hrsLeft = (e_daysLeft - daysLeft) * 24,
        hrsLeft = Math.floor(e_hrsLeft),
        e_minsLeft = (e_hrsLeft - hrsLeft) * 60,
        minsLeft = Math.floor((e_hrsLeft - hrsLeft) * 60),
        e_secsLeft = (e_minsLeft - minsLeft) * 60,
        secsLeft = Math.floor((e_minsLeft - minsLeft) * 60);

    var yearsLeft = 0;
    var monthsLeft = 0
    var weeksLeft = 0;

    if ($format != 'short') {
        if (daysLeft > 365) {
            yearsLeft = Math.floor(daysLeft / 365);
            daysLeft = daysLeft % 365;
        }

        if (daysLeft > 30) {
            monthsLeft = Math.floor(daysLeft / 30);
            daysLeft = daysLeft % 30;
        }
        if (daysLeft > 7) {
            weeksLeft = Math.floor(daysLeft / 7);
            daysLeft = daysLeft % 7;
        }
    }
    var yearsLeft = yearsLeft < 10 ? "0" + yearsLeft : yearsLeft,
        monthsLeft = monthsLeft < 10 ? "0" + monthsLeft : monthsLeft,
        weeksLeft = weeksLeft < 10 ? "0" + weeksLeft : weeksLeft,
        daysLeft = daysLeft < 10 ? "0" + daysLeft : daysLeft,
        hrsLeft = hrsLeft < 10 ? "0" + hrsLeft : hrsLeft,
        minsLeft = minsLeft < 10 ? "0" + minsLeft : minsLeft,
        secsLeft = secsLeft < 10 ? "0" + secsLeft : secsLeft,
        yearsText = yearsLeft > 1 ? 'Années' : 'Année',
        monthsText = monthsLeft > 1 ? 'Mois' : 'Mois',
        weeksText = weeksLeft > 1 ? 'Semaines' : 'Semaine',
        daysText = daysLeft > 1 ? 'Jours' : 'Jour',
        hourText = hrsLeft > 1 ? 'Heures' : 'Heure',
        minsText = minsLeft > 1 ? 'Mins' : 'Min',
        secText = secsLeft > 1 ? 'Secs' : 'Sec';
    var $markup = {
        wrapper: $this.find('.countdown__item'),
        year: $this.find('.yearsLeft'),
        month: $this.find('.monthsLeft'),
        week: $this.find('.weeksLeft'),
        day: $this.find('.daysLeft'),
        hour: $this.find('.hoursLeft'),
        minute: $this.find('.minsLeft'),
        second: $this.find('.secsLeft'),
        yearTxt: $this.find('.yearsText'),
        monthTxt: $this.find('.monthsText'),
        weekTxt: $this.find('.weeksText'),
        dayTxt: $this.find('.daysText'),
        hourTxt: $this.find('.hoursText'),
        minTxt: $this.find('.minsText'),
        secTxt: $this.find('.secsText')
    }
    var elNumber = $markup.wrapper.length;
    $this.addClass('item-' + elNumber);
    $($markup.year).html(yearsLeft);
    $($markup.yearTxt).html(yearsText);
    $($markup.month).html(monthsLeft);
    $($markup.monthTxt).html(monthsText);
    $($markup.week).html(weeksLeft);
    $($markup.weekTxt).html(weeksText);
    $($markup.day).html(daysLeft);
    $($markup.dayTxt).html(daysText);
    $($markup.hour).html(hrsLeft);
    $($markup.hourTxt).html(hourText);
    $($markup.minute).html(minsLeft);
    $($markup.minTxt).html(minsText);
    $($markup.second).html(secsLeft);
    $($markup.secTxt).html(secText);
}
var countDown = (function () {
    return {
        init: function () {
            $('.countdown').each(function () {
                var $this = $(this);
                var $endDate = $(this).data('countdown');
                var $format = $(this).data('format');
                setInterval(function () {
                    makeTimer($endDate, $this, $format);
                }, 0);
            });
        }
    }
})(countDown || {});


/*-- Swiper Secteurs activites
-----------------------------------*/
var swiperSecteursActivite = (function () {
    return {
        init: function () {
            var swiper = new Swiper(".meeta-topics-active .swiper", {
                loop: false,
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 30,
                pagination: {
                    el: ".meeta-topics-active .swiper-pagination",
                    clickable: true,
                },
                breakpoints: {
                    0: {
                        slidesPerView: 1,
                        slidesPerGroup: 1,
                    },
                    768: {
                        slidesPerView: 2,
                        slidesPerGroup: 2,
                    },
                    1200: {
                        slidesPerView: 3,
                        slidesPerGroup: 3,
                    }
                }
            });
        }
    }
})(swiperSecteursActivite || {});


/*-- Swiper Partners
-----------------------------------*/
var swiperPartners = (function () {
    return {
        init: function () {
            var swiper = new Swiper(".meeta-partners-active .swiper", {
                slidesPerGroupSkip: 0,
                loop: true,
                speed: 5000,
                autoplay: {
                    delay: 2000,
                },
                navigation: {
                    nextEl: ".meeta-partners-active .swiper-button-next",
                    prevEl: ".meeta-partners-active .swiper-button-prev",
                },
                breakpoints: {
                    0: {
                        slidesPerView: 6,
                        slidesPerGroup: 5,
                    },
                    375: {
                        slidesPerView: 2,
                        slidesPerGroup: 2,
                    },
                    576: {
                        slidesPerView: 2,
                        slidesPerGroup: 2,
                    },
                    768: {
                        slidesPerView: 3,
                        slidesPerGroup: 3,
                    },
                    1200: {
                        slidesPerView: 5,
                        slidesPerGroup: 5,
                    },
                },
            });
        }
    }
})(swiperPartners || {});


/*-- Swiper Partners Presse
-----------------------------------*/
var swiperPartners2 = (function () {
    return {
        init: function () {
            var swiper = new Swiper(".meeta-partners-active-2 .swiper", {
                slidesPerGroupSkip: 0,
                loop: true,
                speed: 2000,
                autoplay: {
                    delay: 2000,
                },
                navigation: {
                    nextEl: ".meeta-partners-active-2 .swiper-button-next",
                    prevEl: ".meeta-partners-active-2 .swiper-button-prev",
                },
                breakpoints: {
                    0: {
                        slidesPerView: 1,
                        slidesPerGroup: 1,
                    },
                    375: {
                        slidesPerView: 2,
                        slidesPerGroup: 2,
                    },
                    576: {
                        slidesPerView: 2,
                        slidesPerGroup: 2,
                    },
                    768: {
                        slidesPerView: 3,
                        slidesPerGroup: 3,
                    },
                    1200: {
                        slidesPerView: 5,
                        slidesPerGroup: 3,
                    },
                },
            });
        }
    }
})(swiperPartners2 || {});


/*-- Jarallax
-----------------------------------*/
var jarallax = (function () {
    return {
        init: function () {
            $('.jarallax').jarallax({
                speed: 0.5
            });
        }
    }
})(jarallax || {});


/*-- AOS
-----------------------------------*/
var aos = (function () {
    return {
        init: function () {
            AOS.init({
                duration: 1000,
                once: true,
            });
            window.addEventListener('scroll', function () {
                AOS.refresh();
            });
        }
    }
})(aos || {});


/*-- Magnific Popup
-----------------------------------*/
var magnificPopup = (function () {
    return {
        init: function () {
            $('.image-popup').magnificPopup({
                type: 'image',
                gallery: {
                    enabled: true
                },
                image: {
                    titleSrc: 'title'
                }
            });
        }
    }
})(magnificPopup || {});


/*-- MagnificPopup video view
-----------------------------------*/
var magnificPopupVideo = (function () {
    return {
        init: function () {
            $('.popup-video').magnificPopup({
                type: 'iframe'
            });
        }
    }
})(magnificPopupVideo || {});


/*-- Tab Pane
-----------------------------------*/
var tabPane = (function () {
    return {
        init: function () {
            const tabs = document.querySelectorAll('[data-tab-target]')
            const tabContents = document.querySelectorAll('.meeta-event-schedule-tab-pane')
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const target = document.querySelector(tab.dataset.tabTarget)
                    tabContents.forEach(tabContent => {
                        tabContent.classList.remove('active')
                    })
                    tabs.forEach(tab => {
                        tab.classList.remove('active')
                    })
                    tab.classList.add('active')
                    target.classList.add('active')
                })
            });
        }
    }
})(tabPane || {});
