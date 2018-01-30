<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\ConstraintViolationInterface;
use Symfony\Component\Validator\Validation;
use Welp\MailchimpBundle\Event\SubscriberEvent;
use Welp\MailchimpBundle\Subscriber\Subscriber;

class NewsletterController extends Controller
{
    const LIST_ID = 'a8e6f854bb';

    /**
     * @param Request $request
     * @return Response
     * @Route(name="subscribe", path="/{_locale}/subscribe", methods={"POST"})
     */
    public function subscribe(Request $request, TranslatorInterface $translator)
    {
        $email = $request->getContent();
        $validator = Validation::createValidator();
        $violations = $validator->validate($email, array(
            new Email(),
            new NotBlank()
        ));

        if (0 !== count($violations)) {
            /** @var ConstraintViolationInterface $violation */
            foreach ($violations as $violation) {
                $errors[] = $violation->getMessage();
            }

            return new JsonResponse(['error' => $translator->trans('subscribe.invalid_email')], 400);
        }

        $subscriber = new Subscriber(
            $email,
            [],
            ['language' => $request->getLocale()]
        );

        $this->container->get('event_dispatcher')->dispatch(
            SubscriberEvent::EVENT_SUBSCRIBE,
            new SubscriberEvent(self::LIST_ID, $subscriber)
        );

        return new Response($translator->trans('subscribe.success_subscribed'));
    }
}
